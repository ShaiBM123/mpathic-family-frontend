import OpenAI from "openai";
import { zodResponseFormat } from 'openai/helpers/zod';
import { z } from 'zod';
import {nanoid} from "nanoid";
import { IStorage } from "@chatscope/use-chat/dist/interfaces";
import { MessageContentType, MessageDirection, MessageStatus } from "@chatscope/use-chat/dist/enums";
// import { ChatMessage } from "@chatscope/use-chat/dist/ChatMessage";
import {ChatModel, ChatCompletionMessageParam} from "openai/resources";
import {OpenAIBotMessage, OpenAIMessageReceivedType, OpenAIGeneratingMessageType, TextualChatMessage} from './OpenAIInterfaces'
// import { UserTypingEvent } from "@chatscope/use-chat";
import {openAIModel} from "./data/data"

const openai = new OpenAI({
    apiKey: process.env.REACT_APP_OPENAI_KEY,
    dangerouslyAllowBrowser: true
});


export class OpenAIChatConversation{

    storage: IStorage;
    messagesPhases: {[key: string]:{[key: string]: any}};
    // messagesPhaseIdx: number;
    // systemMessages: Array<ChatCompletionMessageParam>;
    messages: Array<ChatCompletionMessageParam>;
    model: (string & {}) | ChatModel;
    max_tokens?: number | null;
    temperature?: number | null;
    messageReceived: OpenAIMessageReceivedType;
    messageIsGenerated: OpenAIGeneratingMessageType;
    openAIUser: string;
    userName: string
  

    constructor(storage: IStorage, messageReceived: OpenAIMessageReceivedType, messageIsGenerated: OpenAIGeneratingMessageType) {
        
        this.storage = storage;

        const Feeling = z.object({
            emotion_name: z.string(),
            emotion_intensity: z.number().int().min(1).max(10),
          });
          
        const Feelings = z.object({
            steps: z.array(Feeling)
          });

        this.messagesPhases = {
            'bot-introduction': {   
       
                messages: [
                    {
                        role: "system",
                        content: "You are an NVC therapist chatbot whose role is to assist users in identifying their emotions and needs during a conflict and help them reconcile the situation empathetically.",
                    },
                    // { "role": "user", "content": "introduce yourself" }
                ],
                max_tokens: 100,
            },
            'ask-user-feelings': {   
     
                messages: [
                    {
                        role: "system",
                        content: "Now, ask the user to tell their feelings about a current conflict situation.",
                    },

                ],
                max_tokens: 50,
            },
            'analyze-feelings': { 
          
                messages: [
                    {
                        role: "system",
                        content: "Given the last user response extract 1-3 dominant feelings reflected in the text.",
                    },

                ],
                response_format: zodResponseFormat(Feelings, "feelings_intensities"),
                max_tokens: 30,
            },
        }

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
        this.messages = [];
        this.model ="gpt-4o-mini"; 
        this.max_tokens = 300; // Maximum tokens to generate in response
        this.temperature = 0.7; // Adjust creativity level, 0.7 for empathetic responses

        this.messageReceived = messageReceived;
        this.messageIsGenerated = messageIsGenerated;
        this.openAIUser = openAIModel.name
        this.userName = this.storage.getState().currentUser?.username || ''
    }

    _startConversation(){

    }

    async fetchMessagePhase(phaseName: string, message: TextualChatMessage | undefined){
        // this.messagesPhaseIdx += 1;
        let phase = this.messagesPhases[phaseName]
        this.messages.concat(phase.messages)
        let message_created_time: Date;
        let message_id: string;

        if (message){
            this.messages.concat({role: "user", content: String(message.content) })
            message_created_time = message.createdTime
            message_id = message.id
        }else{
            message_created_time = new Date();
            message_id = nanoid();
        }

        let bot_messages_reply: Array<OpenAIBotMessage> = [];

        try {
                if (phase.response_format){

                    const completion = await openai.beta.chat.completions.parse({
                    model: this.model,
                    messages: this.messages,
                    response_format: phase.response_format,
                    max_tokens: phase.max_tokens,
                    user: this.userName
                    });
                
                    const bot_choise = completion.choices[0]
                    const bot_msg = bot_choise.message;
                    this.messages.concat(bot_msg)

                    console.log(bot_msg);
                    let content
                    let content_type

                    if (bot_msg.parsed) {
                        console.log(bot_msg.parsed);
                        content = bot_msg.parsed;
                        content_type = MessageContentType.Other;

                    } else if (bot_msg.refusal) {
                        // handle refusal
                        console.log(bot_msg.refusal);
                        content = bot_msg.refusal;
                        content_type = MessageContentType.TextPlain;
                    }

                    bot_messages_reply =[ 
                    {
                        finish_reason: bot_choise.finish_reason, index: bot_choise.index, refusal: bot_msg.refusal,
                        status: MessageStatus.DeliveredToDevice, direction: MessageDirection.Incoming,
                        contentType: content_type as MessageContentType, createdTime: message_created_time,
                        senderId: this.openAIUser, id: message_id.concat('-1'), 
                        content: content as any
                    } ]
                }
                else{
                    const completion = await openai.chat.completions.create({
                        messages: this.messages,
                        max_tokens: this.max_tokens, 
                        temperature: this.temperature, 
                        model: this.model,
                        user: this.userName
                    });

                    let msg_counter = 0;
                    bot_messages_reply = completion.choices.map((c) => {
                        msg_counter+=1;
            
                        return {
                        finish_reason: c.finish_reason, index: c.index, refusal: c.message.refusal,
                        status: MessageStatus.DeliveredToDevice, direction: MessageDirection.Incoming,
                        contentType: MessageContentType.TextPlain, createdTime: message_created_time,
                        senderId: this.openAIUser, id: message_id.concat('-',String(msg_counter)), 
                        content: c.message.content as any 
                    }});
                }

                return bot_messages_reply;

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
    }

    async sendMessage(message: TextualChatMessage, conversationId: string, sender: unknown)
        {

        this.messages = [...this.messages, {role: "user", content: String(message.content) }]

        var intervalId = window.setInterval(
            function(messageIsGenerated: OpenAIGeneratingMessageType, conversationId: string, userId: string){
            messageIsGenerated(conversationId, userId)
          }, 200, this.messageIsGenerated, conversationId, this.openAIUser);
        

        const chatCompletion = await openai.chat.completions.create({
            messages: this.messages,
            max_tokens: this.max_tokens, 
            temperature: this.temperature, 
            model: this.model,
            user: this.storage.getUser(message.senderId)[0]?.username
        });
        
        clearInterval(intervalId) 

        console.log(chatCompletion)
        let msg_counter = 0;
        var messages: Array<OpenAIBotMessage> = chatCompletion.choices.map((c) => {
            msg_counter+=1;

            return {
            finish_reason: c.finish_reason, index: c.index, refusal: c.message.refusal,
            status: MessageStatus.DeliveredToDevice, direction: MessageDirection.Incoming,
            contentType: MessageContentType.Other, createdTime: message.createdTime,
            senderId: this.openAIUser, id: message.id.concat('-',String(msg_counter)), 
            content: c.message.content as any 
        }});
        this.messageReceived(new Date(chatCompletion.created * 1000), conversationId, messages, sender)      

    }

}