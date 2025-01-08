import OpenAI from "openai";
import { MessageContent } from "@chatscope/use-chat/dist/interfaces";
import { MessageContentType, MessageDirection, MessageStatus } from "@chatscope/use-chat/dist/enums";
import {ChatCompletionFunctionMessageParam, ChatModel} from "openai/resources";
import { IStorage } from "@chatscope/use-chat/dist/interfaces";
import {
        OpenAIBotMessage, 
        OpenAIMessageReceivedType, 
        UserMessageContent, 
        UserMessagePhase} from './OpenAITypes';
import {ChatMessage} from "@chatscope/use-chat"; 
import {openAIModel} from "../data/data";
import {FeelingsArray} from '../components/feelings-scale/FeelingsScale';
import {OpenAIPromptManager, SyestemPromptData} from './OpenAIPromptingManager';
import { UpdateState } from "@chatscope/use-chat/dist/Types";
import {ExtendedStorage } from "../data/ExtendedStorage";

const openai = new OpenAI({
    apiKey: process.env.REACT_APP_OPENAI_KEY,
    dangerouslyAllowBrowser: true
});

export type BotMsgReplyProps =  {
    msgIdx: number,
    msgRefusal: boolean, 
    msgContent: object|string | null,
    msgContentType: MessageContentType,
    msgMoreInfoRequired: boolean
}

export class OpenAIChatConversation{
    // msgPhaseBlocks: { [key in UserMessagePhase]?: any}  
    promptMngr: OpenAIPromptManager;
    // messages: Array<ChatCompletionMessageParam>;
    // model: (string & {}) | ChatModel;
    messageReceived: OpenAIMessageReceivedType;
    openAIUser: string;

    constructor(messageReceived: OpenAIMessageReceivedType, storage: IStorage, update: UpdateState) {
        this.promptMngr = new OpenAIPromptManager(storage as ExtendedStorage, update);

        // this.msgPhaseBlocks = {
        //     [UserMessagePhase.GeneralDescriptionAnalysis]: {   

        //         system_msg: [
        //             {
        //                 role: "system",
        //                 content: "בתיאור הבא המשתמש מספר לראשונה על קונפליקט שלו מול אדם אחד או יותר, התיאור אמור להכיל פרטים על הזמן, המקום, המעורבים והסיבה לקונפליקט, על התיאור להיות שלם ואוטנטי מנקודת מבטו של המשתמש"
        //             },
        //             {
        //                 role: "system",
        //                 content: "במידה והתיאור לא מספק או שחסרים בו פרטים עליך לבקש מהמשתמש לספר יותר על מה שלא מפורט"
        //             },
        //             {
        //                 role: "system",
        //                 content: "במידה והתיאור שלם ומספק, 1. סכם בקצרה בגוף שני את רוח הדברים 2. צור תצפית אובייקטיבית על האירוע בהתבסס על השלב הראשון במודל תקשורת מקרבת"
        //             }
        //         ],

        //         response_format: zodResponseFormat( 
        //             z.object({
        //                 more_info_required: z.boolean(), 
        //                 more_info_request: z.union([z.string(), z.null()]), 
        //                 probe_completion: z.union([
        //                     z.object({
        //                         summery: z.string(), 
        //                         observation: z.string()}), 
        //                     z.null()])
        //                 }), "call-for-more-information-or-summerize"),

        //         construct_content_to_reply:(parsed_obj: object)=>{
        //             if(Object(parsed_obj).more_info_required){
        //                 return [
        //                     {
        //                         content: Object(parsed_obj).more_info_request, 
        //                         content_type: MessageContentType.TextPlain,
        //                         more_info_required: true
        //                     }
        //                 ]
        //             }else{
        //                 return [
        //                     {
        //                         content: {...Object(parsed_obj).probe_completion, general_description_analysis: true}, 
        //                         content_type: MessageContentType.Other,
        //                         more_info_required: false
        //                     },
        //                     {
        //                         content: 'כעט בבקשה פרט קצת יותר על התחושות שלך בנוגע לכל מה שקרה', 
        //                         content_type: MessageContentType.TextPlain
        //                     }
        //                 ]

        //             }
        //         },
        //         construct_context:(parsed_obj: object)=>{
        //             if(Object(parsed_obj).more_info_required){
        //                 return [
        //                     {
        //                         role: 'assistant',
        //                         content: Object(parsed_obj).more_info_request, 

        //                     }]
        //             }else{
        //                 return [
        //                     {
        //                         role: 'assistant',
        //                         content: Object(parsed_obj).probe_completion.summery, 
        //                     },
        //                     {
        //                         role: 'assistant',
        //                         content: Object(parsed_obj).probe_completion.observation, 
        //                     },
        //                     {
        //                         role: 'assistant',
        //                         content: 'כעט בבקשה פרט קצת יותר על התחושות שלך בנוגע לכל מה שקרה', 
        //                     }
        //                 ]
        //             }
        //         },
        //         max_tokens: 350,
        //         temperature: 0.7
        //     },
        //     [UserMessagePhase.FeelingsProbe]: { 

        //         system_msg: [
        //             {
        //                 role: "system",
        //                 content: "בהתבסס על התגובות של המשתמש, מצא 1-3 רגשות דומיננטיים המובעים בטקסט ותאר בקצרה את הלך הרוח מההבט הרגשי"
        //             },
        //         ],
            
        //         response_format: zodResponseFormat(
        //             z.object({
        //                 feelings: FeelingsArray, 
        //                 description: z.string()
        //             }), "feelings-intensities"),

        //         construct_content_to_reply:(parsed_obj: object)=>{
        //             return(
        //                 [
        //                     {
        //                         content: Object(parsed_obj).description + 
        //                         " לכל רגש הערכתי את עוצמתו , ניתן לשנות את עוצמות הרגש , למחוק או להוסיף רגשות במידה ולא דייקתי", 
        //                         content_type: MessageContentType.TextPlain,
        //                         more_info_required: false
        //                     },
        //                     {
        //                         content: {...parsed_obj, interactive: true, active: true} , 
        //                         content_type: MessageContentType.Other,
        //                         more_info_required: false
        //                     }
        //                 ]
        //             )
        //         },
        //         construct_context:(parsed_obj: object)=>{
        //             return(
        //                 [{
        //                     role: 'assistant',
        //                     content: Object(parsed_obj).description  
        //                 }, 
        //                 {
        //                     role: 'assistant',
        //                     content:  `להערכתי אתה מרגיש את התחושות הבאות בסולם של אחת עד עשר: 
        //                     ${Object(parsed_obj).feelings.map(
        //                         (s: Object)=>{
        //                             return ` ${Object(s).emotion_name} בעוצמה ${Object(s).emotion_intensity} `
        //                         }
        //                     ).join(' ')}`
        //                 }, 
        //             ])   
        //         },
        //         max_tokens: 200,
        //         temperature: 0.7
        //     },

        //     [UserMessagePhase.FeelingsAnalysis]: { 
        //         system_msg: [
        //             {
        //                 role: "system",
        //                 content: "בהתבסס על תיאור המשתמש את רגשותיו ועוצמתם סכם בקצרה את עולם התוכן הרגשי של המשתמש"
        //             },
        //         ],
        //         construct_content_to_reply:(msg: object)=>{
        //             return [
        //                 {
        //                     content: Object(msg).content, 
        //                     content_type: MessageContentType.TextPlain
        //                 },
        //                 {
        //                     content: 'כעט תאר לי בבקשה מה גורם לך להרגיש ככה ? מה בדיוק פגע בך ?', 
        //                     content_type: MessageContentType.TextPlain
        //                 }
        //             ] 
        //         },
        //         construct_context:(parsed_obj: object)=>{
        //             return [
        //                 {
        //                     role: 'assistant',
        //                     content: Object(parsed_obj).content, 
        //                 },
        //                 {
        //                     role: 'assistant',
        //                     content: 'כעט תאר לי בבקשה מה גורם לך להרגיש ככה ? מה בדיוק פגע בך ?', 
        //                 }
        //             ] 
        //         },
        //         max_tokens: 350,
        //         temperature: 0.7
        //     },

        //     [UserMessagePhase.NeedsProbe]:{   

        //         system_msg: [
        //             {
        //                 role: "system",
        //                 content: "בתיאור הבא המשתמש מספר על הסיבות לרגשותיו, על התיאור לכלול את הצרכים הנפשיים שהתעררו על פי מודל התקשורת המקרבת"
        //             },
        //             {
        //                 role: "system",
        //                 content: "במידה והתיאור מספק ציין עד שלושה צרכים בולטים שהתעררו בעקבות הקונפליקט, אחרת השב בשלילה ובקש משהמשתמש לספר יותר"
        //             },
        //         ],

        //         response_format: zodResponseFormat(
        //             z.object({
        //                 more_info_required: z.boolean(), 
        //                 more_info_request: z.union([z.string(), z.null()]),  
        //                 summery: z.union([z.string(), z.null()])
        //                 }), "call-for-more-information-or-summerize"),

        //         construct_content_to_reply:(parsed_obj: object)=>{
        //             if(Object(parsed_obj).more_info_required){
        //                 return [
        //                     {
        //                         content: Object(parsed_obj).more_info_request, 
        //                         content_type: MessageContentType.TextPlain,
        //                         more_info_required: true
        //                     }
        //                 ]
        //             }else{
        //                 return [
        //                     {
        //                         content: Object(parsed_obj).summery, 
        //                         content_type: MessageContentType.TextPlain,
        //                         more_info_required: false
        //                     }
        //                 ]
        //             }
        //         },
        //         construct_context:(parsed_obj: object)=>{
        //             if(Object(parsed_obj).more_info_required){
        //                 return [
        //                     {
        //                         role: 'assistant',
        //                         content: Object(parsed_obj).more_info_request, 

        //                     }]
        //             }else{
        //                 return [
        //                     {
        //                         role: 'assistant',
        //                         content: Object(parsed_obj).summery, 
        //                     }]
        //             }
        //         },
        //         max_tokens: 350,
        //         temperature: 0.7
        //     },

        //     [UserMessagePhase.TBD]:{ 
        //         system_msg: []
        //     }
        // }

        // this.messages = [ 
        //     {
        //         role: "system",
        //         content: "אתה מטפל בשיטת התקשורת המקרבת (NVC) התפקיד שלך הוא לסייע למשתמשים ליישב בעיות אישיות בצורה אמפתית בשפה העברית.",
        //     }
        // ];
        // this.model ="gpt-4o-mini"; 

        this.messageReceived = messageReceived;
        this.openAIUser = openAIModel.name
    }

    // _getCurrentUser(){
    //     return this.storage.getState().currentUser?.username || '';
    // }

    async doMessagePhase( user_message: ChatMessage<MessageContentType.Other>)
    {
        let msg_content = user_message.content as UserMessageContent
        let msg = msg_content.user_text
        // let msg_phase = msg_content.phase
        // let phase_block
        // let bot_messages_reply: Array<OpenAIBotMessage> = [];
        let bot_message_reply: OpenAIBotMessage = {
            index: 0, 
            refusal: true, 
            more_info_required: true,
            status: MessageStatus.DeliveredToDevice, 
            direction: MessageDirection.Incoming,
            contentType: MessageContentType.TextPlain, 
            createdTime: user_message.createdTime,
            senderId: this.openAIUser, 
            id: user_message.id.concat('-1'), 
            content: "" as unknown as MessageContent<MessageContentType.Other>
        };

        const constructBotMsgReply = ({
            msgIdx,
            msgRefusal, 
            msgContent,
            msgContentType,
            msgMoreInfoRequired}: BotMsgReplyProps) => {

            return  {
                index: msgIdx, 
                refusal: msgRefusal, 
                more_info_required: msgMoreInfoRequired,
                status: MessageStatus.DeliveredToDevice, 
                direction: MessageDirection.Incoming,
                contentType: msgContentType, 
                createdTime: user_message.createdTime,
                senderId: this.openAIUser, 
                id: user_message.id.concat('-',String(msgIdx + 1)), 
                content: msgContent as unknown as MessageContent<MessageContentType.Other>
            } 
        }

        try 
        {
            let prompt_data = this.promptMngr.buildSyestemPrompt()
            this.promptMngr.addUserInputToHistory(msg)
            
            const completion = await openai.beta.chat.completions.parse({
                model: this.promptMngr.model,
                messages: this.promptMngr.history as Array<any>,
                response_format: prompt_data?.response_format,
                max_tokens: prompt_data?.max_tokens,
                temperature: prompt_data?.temperature,
                user: user_message.senderId 
            });
            
            const bot_choise = completion.choices[0]
            const {parsed, refusal} = bot_choise?.message

            let bot_reply = this.promptMngr.buildBotResponse({parsed, refusal})
            bot_message_reply = constructBotMsgReply({
                    msgIdx: 0, 
                    msgRefusal: refusal ? true: false, 
                    msgContent: bot_reply.content, 
                    msgContentType: bot_reply.content_type, 
                    msgMoreInfoRequired: bot_reply.more_info_required}
            )

        } catch (e: any) {
            // Handle edge cases
            if (e.constructor.name === "LengthFinishReasonError") {
              // Retry with a higher max tokens
              console.log("Too many tokens: ", e.message);
            } else {
              // Handle other exceptions
              console.log("An error occurred: ", e.message);
            }

            bot_message_reply = constructBotMsgReply({
                msgIdx: 0, 
                msgRefusal: true, 
                msgContent: 'מתנצלים, משהוא השתבש :-(', 
                msgContentType: MessageContentType.TextPlain, 
                msgMoreInfoRequired: true}
            )
        }
        finally {
            return [bot_message_reply];
        }
    }

    async sendMessage(
        message: ChatMessage<MessageContentType.Other>, 
        intervalId: number,
        conversationId: string,
        sender: unknown)
    {
        let messages= await this.doMessagePhase(message) 

        this.messageReceived(new Date(), intervalId, conversationId, messages, sender)      

    }

}