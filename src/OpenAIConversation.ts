import OpenAI from "openai";
import { IStorage, MessageContent } from "@chatscope/use-chat/dist/interfaces";
import { MessageContentType, MessageDirection, MessageStatus } from "@chatscope/use-chat/dist/enums";
import {ChatModel, ChatCompletionMessageParam} from "openai/resources";
import {
    OpenAIBotMessage, 
    OpenAIMessageReceivedType, 
    OpenAIGeneratingMessageType, 
    TextualChatMessage, 
    OpenAIMessagePhase} from './OpenAIInterfaces'

import {openAIModel} from "./data/data"
import {FeelingsResponseFormat} from './components/feelings-scale/FeelingsScale'

const openai = new OpenAI({
    apiKey: process.env.REACT_APP_OPENAI_KEY,
    dangerouslyAllowBrowser: true
});


export class OpenAIChatConversation{

    storage: IStorage;
    // messagesPhases: {[key: string]:{[key: string]: any}};
    messagesPhases: Array<{[key: string]: any}>;
    messagesPhaseIdx: OpenAIMessagePhase;
    // systemMessages: Array<ChatCompletionMessageParam>;
    messages: Array<ChatCompletionMessageParam>;
    model: (string & {}) | ChatModel;
    // max_tokens?: number | null;
    // temperature?: number | null;
    messageReceived: OpenAIMessageReceivedType;
    messageIsGenerated: OpenAIGeneratingMessageType;
    openAIUser: string;

    constructor(storage: IStorage, messageReceived: OpenAIMessageReceivedType, messageIsGenerated: OpenAIGeneratingMessageType) {
        
        this.storage = storage;

        this.messagesPhaseIdx = 0;
        this.messagesPhases = [
            {   
                name: 'ask-user-feelings',
                messages: [
                    {
                        role: "system",
                        content: "בהנתן בתיאור הבא של הקונפליקט האישי, שאל את המשתמש אם יוכל לספר יותר על הרגשות שלו בנוגע למצב."
                    },

                ],
                max_tokens: 110,
                temperature: 0.7
            },
            { 
                name: 'analyze-feelings',
                messages: [
                    {
                        role: "system",
                        content: "בהתבסס על התגובה הקודמת והנוכחית של המשתמש, מצא 1-3 רגשות דומיננטיים המובעים בטקסט.",
                    },

                ],
                initial_valid_response_message: {
                    role: "assistant",
                    content: "מתוך התיאור שלך הבנתי שאתה חש ברגשות הבאים , לכל רגש הערכתי את עוצמתו , ניתן לשנות את עוצמות הרגש במידה ולא דייקתי",
                },
                response_format: FeelingsResponseFormat,
                max_tokens: 50,
                // temperature: 0.7
            },
        ]

        // this.systemMessages = [
        //     {
        //     role: "system",
        //     content: "You are an NVC therapist chatbot whose role is to assist users in identifying their emotions and needs during a conflict and help them reconcile the situation empathetically.",
        //     },
        //     {
        //     role: "system",
        //     content: "First, handle a brief discussion with the user to help them express their feelings about a current conflict situation.",
        //     },
        //     {
        //     role: "system",
        //     content: "Once the user has shared their situation, identify and print up to 3 of the most prominent emotions they are experiencing.",
        //     },
        //     {
        //     role: "system",
        //     content: "Next, engage in a short conversation to reveal which specific needs related to those emotions are being affected by the situation.",
        //     },
        //     {
        //     role: "system",
        //     content: "After identifying the affected needs provide empathetic suggestions for conflict resolution.",
        //     }
        // ];
        this.messages = [ 
            {
                role: "system",
                content: "אתה מטפל בשיטת התקשורת המקרבת (NVC) התפקיד שלך הוא לסייע למשתמשים ליישב בעיות אישיות בצורה אמפתית.",
            }
        ];
        this.model ="gpt-4o-mini"; 

        this.messageReceived = messageReceived;
        this.messageIsGenerated = messageIsGenerated;
        this.openAIUser = openAIModel.name
    }

    _getCurrentUser(){
        return this.storage.getState().currentUser?.username || '';
    }

    async fetchMessagePhase(message: TextualChatMessage){
        
        let phase = this.messagesPhases[this.messagesPhaseIdx]
        this.messages = 
            [...this.messages, ...phase.messages, {role: "user", content: String(message.content) }]

        let bot_messages_reply: Array<OpenAIBotMessage> = [];

        try {
                if (phase.response_format){

                    const completion = await openai.beta.chat.completions.parse({
                    model: this.model,
                    messages: this.messages,
                    response_format: phase.response_format,
                    max_tokens: phase.max_tokens,
                    user: this._getCurrentUser()
                    });
                
                    const bot_choise = completion.choices[0]
                    const bot_msg = bot_choise.message;
                    this.messages = [...this.messages, bot_msg]

                    console.log(bot_msg);
                    let response_messages_content = []

                    if (bot_msg.parsed) {
                        console.log(bot_msg.parsed);
                        if (phase.initial_valid_response_message){
                            response_messages_content.push({content: phase.initial_valid_response_message.content, content_type: MessageContentType.TextPlain})}
                        response_messages_content.push({content: bot_msg.parsed, content_type: MessageContentType.Other})

                    } else if (bot_msg.refusal) {
                        // handle refusal
                        console.log(bot_msg.refusal);
                        response_messages_content.push({content: bot_msg.refusal, content_type: MessageContentType.TextPlain})
                    }
                    
                    bot_messages_reply = response_messages_content.map((m, i) => {
                        return  {
                            finish_reason: bot_choise.finish_reason, index: i, refusal: bot_msg.refusal,
                            status: MessageStatus.DeliveredToDevice, direction: MessageDirection.Incoming,
                            contentType: m.content_type as MessageContentType, createdTime: message.createdTime,
                            senderId: this.openAIUser, id: message.id.concat('-',String(i+1)), 
                            content: m.content as unknown as MessageContent<MessageContentType.Other>
                        }  
                    })
                }
                else{
                    const completion = await openai.chat.completions.create({
                        model: this.model,
                        messages: this.messages,
                        max_tokens: phase.max_tokens, 
                        temperature: phase.temperature, 
                        user: this._getCurrentUser()
                    });

                    bot_messages_reply = completion.choices.map((c, i) => {

                        this.messages = [...this.messages, c.message]
            
                        return {
                        finish_reason: c.finish_reason, index: c.index, refusal: c.message.refusal,
                        status: MessageStatus.DeliveredToDevice, direction: MessageDirection.Incoming,
                        contentType: MessageContentType.TextPlain, createdTime: message.createdTime,
                        senderId: this.openAIUser, id: message.id.concat('-',String(i+1)), 
                        content: c.message.content as unknown as MessageContent<MessageContentType.TextPlain> 
                    }});
                }

          } catch (e: any) {
            // Handle edge cases
            if (e.constructor.name === "LengthFinishReasonError") {
              // Retry with a higher max tokens
              console.log("Too many tokens: ", e.message);
            } else {
              // Handle other exceptions
              console.log("An error occurred: ", e.message);
            }
          }
          finally {
            this.messagesPhaseIdx += 1;
            return bot_messages_reply;
          }
    }

    async _startConversation(){
    }

    async sendMessage(message: TextualChatMessage, conversationId: string, sender: unknown)
    {
        var intervalId = window.setInterval(
            function(messageIsGenerated: OpenAIGeneratingMessageType, conversationId: string, userId: string){
            messageIsGenerated(conversationId, userId)
          }, 200, this.messageIsGenerated, conversationId, this.openAIUser);


        let messages= await this.fetchMessagePhase(message)

        clearInterval(intervalId) 

        this.messageReceived(new Date(), conversationId, messages, sender)      

    }

}