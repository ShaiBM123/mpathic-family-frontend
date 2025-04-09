// import OpenAI from "openai";
import { MessageContent } from "@chatscope/use-chat/dist/interfaces";
import { MessageContentType, MessageDirection, MessageStatus } from "@chatscope/use-chat/dist/enums";
import { IStorage } from "@chatscope/use-chat/dist/interfaces";
import {
    OpenAIBotMessage,
    OpenAIMessageReceivedType,
    UserMessageContent,
    MsgContentData,
    UserMessagePhase
} from './OpenAITypes';
import { ChatMessage } from "@chatscope/use-chat";
import { openAIModel, RelationshipCategory, Gender } from "../data/data";
import { relationships } from './PersonalRelationships';
// import { OpenAIPromptManager } from './OpenAIPromptingManager';
import { UpdateState } from "@chatscope/use-chat/dist/Types";
import { ExtendedStorage } from "../data/ExtendedStorage";
import { ageCategory } from '../AppUtils';
import { UserChatSessionData } from "../data/ChatSessionData";
import callApi from "../lib/apisauce/callApi";
import { queryString } from "../AppUtils";
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

export class OpenAIChatConversation {
    storage: ExtendedStorage;
    update: UpdateState;
    messageReceived: OpenAIMessageReceivedType;
    openAIUser: string;

    constructor(messageReceived: OpenAIMessageReceivedType, storage: IStorage, update: UpdateState) {
        this.storage = storage as ExtendedStorage;
        this.update = update;
        this.messageReceived = messageReceived;
        this.openAIUser = openAIModel.name
    }

    private genderName(gender: Gender | undefined): 'female' | 'male' {
        return gender === Gender.Female ? 'female' : 'male';
    }

    private doNextPhase = (nextPhase: UserMessagePhase) => {
        const { currentUserSessionData: sessionData } = (this.storage as ExtendedStorage)?.getState();

        let phase = sessionData.user_phase;
        let phaseCount = sessionData.phase_count || 0;

        if (nextPhase === phase) {
            this.storage?.setPhaseCount(phaseCount + 1);
        }
        else {
            this.storage?.setPhase(nextPhase);
            this.storage?.setPhaseCount(0);
        }
    }

    private generateFollowUpText = (phase: UserMessagePhase): string => {
        const { currentUser, currentUserSessionData } = (this.storage as ExtendedStorage)?.getState();

        let uGender = currentUser?.data.gender;
        let uGenderKey = this.genderName(uGender);

        let u2Gender = currentUserSessionData.person_in_conflict.relationship?.gender;
        let u2GenderKey = this.genderName(u2Gender);

        switch (phase) {
            case UserMessagePhase.BE_PersonInConflictName:
                return rtlTxt.chat.askWhatIsTheNameOfPersonInConflict[u2GenderKey];
            case UserMessagePhase.BE_DescriptionAnalysis:
                return rtlTxt.chat.callForSituationInfo[uGenderKey];
            case UserMessagePhase.BE_PersonInConflictAge:
                return rtlTxt.chat.askHowOldPersonInConflict[u2GenderKey];
            default:
                return ``;
        }
    }

    private buildBotResponse = () => {
        const { currentUser, currentUserSessionData: sessionData } = (this.storage as ExtendedStorage)?.getState();

        let phase = sessionData.user_phase;
        // let uName = currentUser?.firstName as string;
        let uGender = currentUser?.data.gender;
        let uGenderKey = this.genderName(uGender);
        let uAge = currentUser?.data.age;
        let uAgeCategory = ageCategory(uAge);

        let personInConflict = sessionData.person_in_conflict;
        let u2Gender = personInConflict?.relationship?.gender;
        let u2GenderKey = this.genderName(u2Gender);

        let more_input_required = true

        let replys: Array<MsgContentData> = []
        let addReply = (
            { content, content_type = MessageContentType.TextHtml }: MsgContentData) => {
            replys.push({ content: content, content_type: content_type })
        }

        // let assistant_msg;
        let next_phase = phase;

        // let parsed_msg = Object(bot_msg.parsed)

        switch (phase) {

            case UserMessagePhase.BE_PersonInConflictRelation:
                let rel = sessionData.person_in_conflict.relationship
                if (!rel) {
                    addReply({ content: rtlTxt.chat.complainAboutPersonInConflictRelationIsIncomplete[uGenderKey][uAgeCategory] })
                }
                else {
                    more_input_required = false;

                    if (relationships({ category: RelationshipCategory.Parents }).includes(rel.relationship_to_user)) {
                        next_phase = UserMessagePhase.BE_DescriptionAnalysis;
                    }
                    else {
                        next_phase = UserMessagePhase.BE_PersonInConflictName;
                    }

                    addReply({ content: this.generateFollowUpText(next_phase) });
                }

                break;

            case UserMessagePhase.BE_PersonInConflictName:
                let rel_to_user = sessionData.person_in_conflict.relationship?.relationship_to_user
                let first_name = sessionData.person_in_conflict.name?.first_name
                if (!first_name) {
                    addReply({ content: rtlTxt.chat.complainAboutPersonInConflictName[uGenderKey][u2GenderKey] })

                } else {
                    more_input_required = false;

                    if (relationships({ category: RelationshipCategory.SiblingsOrChildren }).includes(rel_to_user as string)) {
                        next_phase = UserMessagePhase.BE_PersonInConflictAge;
                    }
                    else {
                        next_phase = UserMessagePhase.BE_DescriptionAnalysis;
                    }
                    addReply({ content: this.generateFollowUpText(next_phase) });
                }

                break;

            case UserMessagePhase.BE_PersonInConflictAge:
                let age = sessionData.person_in_conflict.age
                if (!age) {
                    addReply({ content: rtlTxt.chat.complainAboutPersonInConflictAge[u2GenderKey] })

                } else {
                    more_input_required = false;
                    next_phase = UserMessagePhase.BE_DescriptionAnalysis;
                    addReply({ content: this.generateFollowUpText(next_phase) })
                }

                break;

            case UserMessagePhase.BE_DescriptionAnalysis:
                let description_analysis = sessionData.description_analysis;
                if (!description_analysis.description_is_complete) {
                    addReply({ content: description_analysis.more_details_request })
                }
                else {

                    more_input_required = false;
                    // phase is unknown at that point because the user can decide he is not 
                    // satisfied with the given observation and keep feeding more information
                    // next_phase = UserMessagePhase.Unknown;

                    addReply({
                        content: description_analysis.reflection_2nd_person_by_age_group,
                        content_type: MessageContentType.TextPlain
                    })
                    addReply({
                        content: { id: "observation_approval", observation: description_analysis.reflection_2nd_person_by_age_group },
                        content_type: MessageContentType.Other
                    })
                }
                break;

            default:
                throw Error('Invalid User Message Phase');
        }

        this.storage.setMoreUserInputRequired(more_input_required);
        this.doNextPhase(next_phase)
        this.update();
        return replys;
    }
    // _getCurrentUser(){
    //     return this.storage.getState().currentUser?.username || '';
    // }

    async doMessagePhase(user_message: ChatMessage<MessageContentType.Other>) {
        const { currentUser, currentUserSessionData } = (this.storage as ExtendedStorage)?.getState();
        let msg_content = user_message.content as UserMessageContent
        let msg = msg_content.user_text

        let bot_message_replys: Array<OpenAIBotMessage> = []

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
                senderId: this.openAIUser,
                id: user_message.id.concat('-', String(msgIdx + 1)),
                content: msgContent as unknown as MessageContent<MessageContentType.Other>
            }
        }

        try {
            const res = await callApi.postData(
                "chat_phase",
                queryString({ username: currentUser?.username, message: msg, session_data: currentUserSessionData }),
                {
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
                    },
                }
            ) as ApiResponse<any>;

            if (res?.ok) {
                if (res.data.status === "success") {
                    const sessionData = res.data as UserChatSessionData;
                    this.storage.setCurrentUserSessionData(sessionData);

                    bot_message_replys = this.buildBotResponse().map((msg, idx) => {
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

    async sendMessage(
        message: ChatMessage<MessageContentType.Other>,
        intervalId: number,
        conversationId: string,
        sender: unknown) {
        let messages = await this.doMessagePhase(message)

        this.messageReceived(new Date(), intervalId, conversationId, messages, sender)

    }

}