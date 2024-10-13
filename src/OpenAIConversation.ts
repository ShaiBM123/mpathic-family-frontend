import OpenAI from "openai";
import { IStorage } from "@chatscope/use-chat/dist/interfaces";
import { MessageContentType, MessageDirection, MessageStatus } from "@chatscope/use-chat/dist/enums";
import { ChatMessage } from "@chatscope/use-chat/dist/ChatMessage";
import {ChatModel, ChatCompletionMessageParam} from "openai/resources";
import {IOpenAIBotCompleteMessage, OpenAIMessageReceivedType, OpenAIGeneratingMessageType} from './OpenAIInterfaces'
// import { UserTypingEvent } from "@chatscope/use-chat";
import {openAIModel} from "./data/data"

const openai = new OpenAI({
    apiKey: process.env.REACT_APP_OPENAI_KEY,
    dangerouslyAllowBrowser: true
});


export class OpenAIChatConversation{

    storage: IStorage;
    systemMessages: Array<ChatCompletionMessageParam>;
    messages: Array<ChatCompletionMessageParam>;
    model: (string & {}) | ChatModel;
    max_tokens?: number | null;
    temperature?: number | null;
    messageReceived: OpenAIMessageReceivedType;
    messageIsGenerated: OpenAIGeneratingMessageType;
    openAIUser: string;
  

    constructor(storage: IStorage, messageReceived: OpenAIMessageReceivedType, messageIsGenerated: OpenAIGeneratingMessageType) {
        
        this.storage = storage;
        this.systemMessages = [
            {
            role: "system",
            content: "You are an NVC therapist chatbot whose role is to assist users in identifying their emotions and needs during a conflict and help them reconcile the situation empathetically.",
            },
            {
            role: "system",
            content: "First, handle a brief discussion with the user to help them express their feelings about a current conflict situation.",
            },
            {
            role: "system",
            content: "Once the user has shared their situation, identify and print up to 3 of the most prominent emotions they are experiencing.",
            },
            {
            role: "system",
            content: "Next, engage in a short conversation to reveal which specific needs related to those emotions are being affected by the situation.",
            },
            {
            role: "system",
            content: "After identifying the affected needs provide empathetic suggestions for conflict resolution.",
            }
        ];
        this.messages = [...this.systemMessages];
        this.model ="gpt-4o-mini"; 
        this.max_tokens = 300; // Maximum tokens to generate in response
        this.temperature = 0.7; // Adjust creativity level, 0.7 for empathetic responses

        this.messageReceived = messageReceived;
        this.messageIsGenerated = messageIsGenerated;
        this.openAIUser = openAIModel.name
    }

    _startConversation(){

    }

    async sendMessage(
        message: 
            ChatMessage<MessageContentType.TextPlain | MessageContentType.TextMarkdown| MessageContentType.TextHtml>, 
        conversationId: string, sender: unknown)
        {

        this.messages = [...this.messages, {role: "user", content: String(message.content) }]

        var intervalId = window.setInterval(
            function(messageIsGenerated: OpenAIGeneratingMessageType, conversationId: string, userId: string){
            messageIsGenerated(conversationId, userId)
          }, 500, this.messageIsGenerated, conversationId, this.openAIUser);
        

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
        var messages: Array<IOpenAIBotCompleteMessage> = chatCompletion.choices.map((c) => {
            msg_counter+=1;
            return {
            finish_reason: c.finish_reason, index: c.index, refusal: c.message.refusal,
            status: MessageStatus.DeliveredToDevice, direction: MessageDirection.Incoming,
            contentType: MessageContentType.Other, createdTime: message.createdTime,
            senderId: this.openAIUser, id: message.id.concat('-',String(msg_counter)), 
            content: c.message.content 
        }});
        this.messageReceived(new Date(chatCompletion.created * 1000), conversationId, messages, sender)
        

        
        

    }

}