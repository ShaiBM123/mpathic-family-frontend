// import OpenAI from "openai";
import { MessageContent } from "@chatscope/use-chat/dist/interfaces";
import { MessageContentType, MessageDirection, MessageStatus } from "@chatscope/use-chat/dist/enums";
import { IStorage } from "@chatscope/use-chat/dist/interfaces";
import {
    LLMBotMessage,
    LLMMessageReceivedType,
    UserMessageContent,
    MsgContentData,
    UserPhase
} from './LLMTypes';
import { ChatMessage } from "@chatscope/use-chat";
import { AIModel } from "../data/data";
// import { relationships } from './PersonalRelationships';
// import { OpenAIPromptManager } from './OpenAIPromptingManager';
import { UpdateState } from "@chatscope/use-chat/dist/Types";
import { ExtendedStorage } from "../data/ExtendedStorage";
import { ageCategory } from '../AppUtils';
// import { UserChatSessionData } from "../data/ChatSessionData";
import callApi from "../lib/apisauce/callApi";
// import { queryString } from "../AppUtils";
import type { ApiResponse } from "apisauce/apisauce";
import rtlTxt from '../rtl-text.json';


// const openai = new OpenAI({
//     apiKey: process.env.REACT_APP_OPENAI_KEY,
//     dangerouslyAllowBrowser: true
// });

export type BotMsgReplyProps = {
    msgIdx: number,
    msgRefusal: boolean,
    msgContent: object | string | null,
    msgContentType: MessageContentType
}

export class LLMChatConversation {
    storage: ExtendedStorage;
    update: UpdateState;
    messageReceived: LLMMessageReceivedType;
    AIUser: string;

    constructor(messageReceived: LLMMessageReceivedType, storage: IStorage, update: UpdateState) {
        this.storage = storage as ExtendedStorage;
        this.update = update;
        this.messageReceived = messageReceived;
        this.AIUser = AIModel.name
    }

    // private genderName(gender: Gender | undefined): 'female' | 'male' {
    //     return gender === Gender.Female ? 'female' : 'male';
    // }

    private generateFollowUpText = (phase: UserPhase): string => {
        const { currentUser, currentUserSessionData: sData } = (this.storage as ExtendedStorage)?.getState();

        let uGenderKey = currentUser?.data.gender as 'female' | 'male';
        let u2GenderKey = sData.person_in_conflict.gender;

        switch (phase) {
            case UserPhase.BE_PersonInConflictName:
                return rtlTxt.chat.askWhatIsTheNameOfPersonInConflict[u2GenderKey];
            case UserPhase.BE_DescriptionAnalysis:
                return rtlTxt.chat.callForSituationInfo[uGenderKey];
            case UserPhase.BE_PersonInConflictAge:
                return rtlTxt.chat.askHowOldPersonInConflict[u2GenderKey];
            default:
                return ``;
        }
    }

    private buildBotResponse = (phase: UserPhase) => {
        const { currentUser, currentUserSessionData: sData } =
            (this.storage as ExtendedStorage)?.getState();

        let next_phase = sData.user_phase;
        // let uName = currentUser?.firstName as string;
        let uGenderKey = currentUser?.data.gender as 'female' | 'male';
        let uAge = currentUser?.data.age;
        let uAgeCategory = ageCategory(uAge);

        // let personInConflict = sData.person_in_conflict;
        let u2GenderKey = sData.person_in_conflict?.gender;

        let more_input_required = true

        let replys: Array<MsgContentData> = []
        let addReply = (
            { content, content_type = MessageContentType.TextHtml }: MsgContentData) => {
            replys.push({ content: content, content_type: content_type })
        }

        switch (phase) {

            case UserPhase.BE_PersonInConflictRelation:
                if (!sData.person_in_conflict.relationship_to_user) {
                    addReply({ content: rtlTxt.chat.complainAboutPersonInConflictRelationIsIncomplete[uGenderKey][uAgeCategory] })
                }
                else {
                    more_input_required = false;
                    addReply({ content: this.generateFollowUpText(next_phase) });
                }
                break;

            case UserPhase.BE_PersonInConflictName:
                if (!sData.person_in_conflict.name?.first_name) {
                    addReply({ content: rtlTxt.chat.complainAboutPersonInConflictName[uGenderKey][u2GenderKey] })

                } else {
                    more_input_required = false;
                    addReply({ content: this.generateFollowUpText(next_phase) });
                }
                break;

            case UserPhase.BE_PersonInConflictAge:
                if (!sData.person_in_conflict.age) {
                    addReply({ content: rtlTxt.chat.complainAboutPersonInConflictAge[u2GenderKey] })

                } else {
                    more_input_required = false;
                    addReply({ content: this.generateFollowUpText(next_phase) })
                }
                break;

            case UserPhase.BE_DescriptionAnalysis:
                let description_analysis = sData.description_analysis;
                if (!description_analysis.description_is_complete) {
                    addReply({ content: description_analysis.more_details_request })
                }
                else {
                    more_input_required = false;
                    // phase is unknown at that point because the user can decide he is not 
                    // satisfied with the given observation and keep feeding more information

                    addReply({
                        content: description_analysis.reflection,
                        content_type: MessageContentType.TextHtml
                    })
                    addReply({
                        content: { id: "observation_approval", feelings: description_analysis.feelings },
                        content_type: MessageContentType.Other
                    })
                }
                break;

            case UserPhase.BE_FeelingsAnalysis:
                more_input_required = false;
                addReply({
                    content: sData.feelings_analysis.description,
                    content_type: MessageContentType.TextHtml
                })
                break;

            default:
                throw Error('Invalid User Message Phase');
        }

        this.storage.setMoreUserInputRequired(more_input_required);
        // this.doNextPhase(next_phase)
        this.update();
        return replys;
    }
    // _getCurrentUser(){
    //     return this.storage.getState().currentUser?.username || '';
    // }

    async doMessagePhase(user_message: ChatMessage<MessageContentType.Other>) {
        const { currentUser, currentUserSessionData: sData } =
            (this.storage as ExtendedStorage)?.getState();

        const JWToken = JSON.parse(sessionStorage.getItem("UserJWT") as string);

        let msg_content = user_message.content as UserMessageContent
        let msg = msg_content.user_text
        let bot_message_replys: Array<LLMBotMessage> = []
        let phase = sData.user_phase;

        const constructBotMsgReply = ({
            msgIdx,
            msgRefusal,
            msgContent,
            msgContentType }: BotMsgReplyProps) => {

            return {
                index: msgIdx,
                refusal: msgRefusal,
                status: MessageStatus.DeliveredToDevice,
                direction: MessageDirection.Incoming,
                contentType: msgContentType,
                createdTime: user_message.createdTime,
                senderId: this.AIUser,
                id: user_message.id.concat('-', String(msgIdx + 1)),
                content: msgContent as unknown as MessageContent<MessageContentType.Other>
            }
        }

        try {
            const res = await callApi.postData(
                "chat_phase",
                { username: currentUser?.username, message: msg, ...sData },
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: JWToken,
                    },
                }
            ) as ApiResponse<any>;

            if (res?.ok) {
                if (res.data.status === "success") {
                    this.storage.setCurrentUserSessionData(res.data.chatSessionData);

                    let bot_messages = this.buildBotResponse(phase);

                    bot_message_replys = bot_messages.map((msg, idx) => {
                        return constructBotMsgReply({
                            msgIdx: idx,
                            msgRefusal: false,
                            msgContent: msg.content,
                            msgContentType: msg.content_type as MessageContentType
                        })
                    })

                } else {
                    throw new Error(res.data.message);
                }
            } else {
                throw res.originalError;
            }

        } catch (e: any) {
            // Handle edge cases
            if (e.constructor?.name === "LengthFinishReasonError") {
                // Retry with a higher max tokens
                console.log("Too many tokens: ", e.message);
            } else {
                // Handle other exceptions
                console.log("An error occurred: ", e.message);
            }

            bot_message_replys = [constructBotMsgReply({
                msgIdx: 0,
                msgRefusal: true,
                msgContent: 'מתנצלים, משהוא השתבש :-(',
                msgContentType: MessageContentType.TextPlain
            }
            )]
        }
        finally {
            return bot_message_replys;
        }
    }

    async storeChatScopeMessages() {
        const { currentUser, currentMessages } = (this.storage as ExtendedStorage)?.getState();

        const JWToken = JSON.parse(sessionStorage.getItem("UserJWT") as string);

        const res = await callApi.postData("store_chatscope_session_messages",
            { username: currentUser?.username, messages: currentMessages },
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: JWToken,
                },
            }
        ) as ApiResponse<any>;

        if (res?.ok) {
            if (res.data.status !== "success") {
                console.log("An error occurred in storeChatScopeMessages: ", res.data.message);

            }
        } else {
            console.log("An error occurred in storeChatScopeMessages: ", res.originalError);
        }
    }

    async sendMessage(
        message: ChatMessage<MessageContentType.Other>,
        intervalId: number,
        conversationId: string,
        sender: unknown) {

        let messages = await this.doMessagePhase(message);
        this.messageReceived(new Date(), intervalId, conversationId, messages, sender);
        // store the chat messages asynchronously
        this.storeChatScopeMessages();
    }

}