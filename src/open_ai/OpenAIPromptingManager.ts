import { z } from 'zod';
import type { infer as zodInfer, ZodType } from 'zod';
import { zodResponseFormat } from 'openai/helpers/zod';
import { AutoParseableResponseFormat } from 'openai/lib/parser';
import { ExtendedStorage } from "../data/ExtendedStorage";
import { UserMessagePhase, MsgContentData } from './OpenAITypes';
import { UserInRelationshipData } from "../data/UserInRelationshipData";
import { UpdateState } from "@chatscope/use-chat/dist/Types";
import { MessageContentType } from "@chatscope/use-chat/dist/enums";
import { ChatModel } from "openai/resources";
import { RelationshipCategory, Gender } from '../data/data';
import { relationships } from './PersonalRelationships';
import { FeelingsArray } from '../components/feelings-scale/FeelingsScale';
import { formatMessage, ageCategory } from '../AppUtils';
import rtlTxt from '../rtl-text.json';

export type SyestemPromptData = {
    response_format: AutoParseableResponseFormat<zodInfer<ZodType>>,
    max_tokens: number,
    temperature: number
} | undefined

function genderKey(gender: Gender | undefined): 'female' | 'male' {
    return gender === Gender.Female ? 'female' : 'male';
}

export class OpenAIPromptManager {
    private storage: ExtendedStorage;
    private updateState: UpdateState;
    model: (string & {}) | ChatModel;

    constructor(storage: ExtendedStorage, update: UpdateState) {
        this.storage = storage;
        this.updateState = update;
        this.model = "gpt-4o-mini";
    }

    buildSyestemPrompt = (): SyestemPromptData => {
        const { phase, phaseCount, topic, subTopic, currentUser, userInRelationship } = this.storage?.getState();

        let uName = currentUser?.firstName as string;
        let uGender = currentUser?.data.gender;
        let uGenderKey = genderKey(uGender);
        let uAge = currentUser?.data.age;
        let uAgeCategory = ageCategory(uAge);

        let u2Name = userInRelationship.firstName;
        let u2Gender = userInRelationship?.data?.gender;
        let u2GenderKey = genderKey(u2Gender);
        let u2Relationship = userInRelationship.data?.relationship as string;

        switch (phase) {

            case UserMessagePhase.BE_PersonInConflictRelation:
                if (phaseCount === 0) {
                    this.storage.addOpenAIHistoryText(
                        "system",
                        formatMessage(rtlTxt.system.askAboutPersonInConflictRelation[uGenderKey], { uName: uName }));
                }

                return {

                    response_format: zodResponseFormat(z.object({
                        person_in_conflict_info:
                            z.union([
                                z.union([
                                    z.object({
                                        gender: z.enum([Gender.Female]),
                                        relationship_to_user:
                                            z.enum(relationships({ gender: Gender.Female }) as [string, ...string[]])
                                    }),
                                    z.object({
                                        gender: z.enum([Gender.Male]),
                                        relationship_to_user:
                                            z.enum(relationships({ gender: Gender.Male }) as [string, ...string[]])
                                    })
                                ]),
                                z.null()])

                    }), "person_in_conflict_to_user_relationship"),

                    max_tokens: 200,
                    temperature: 0.2
                };

            case UserMessagePhase.BE_PersonInConflictName:
                if (phaseCount === 0) {
                    this.storage.addOpenAIHistoryText(
                        "system", rtlTxt.system.askAboutPersonInConflictName[u2GenderKey]);
                }

                return {

                    response_format: zodResponseFormat(z.object({
                        first_name: z.union([z.string().describe(rtlTxt.zodFieldDescription.firstName), z.null()])
                    }), "person_in_conflict_first_name"),

                    max_tokens: 200,
                    temperature: 0.1
                };

            case UserMessagePhase.BE_PersonInConflictAge:
                if (phaseCount === 0) {
                    this.storage.addOpenAIHistoryText("system",
                        formatMessage(rtlTxt.system.askAboutPersonInConflictAge[u2GenderKey], { u2Name: u2Name })
                    )
                }

                return {
                    response_format: zodResponseFormat(z.object({
                        age: z.union([z.number().describe(rtlTxt.zodFieldDescription.age), z.null()]),
                    }), "age_of_the_person_in_conflict"),
                    max_tokens: 200,
                    temperature: 0.7
                };
            case UserMessagePhase.BE_ObservationAnalysis:
                if (phaseCount === 0) {
                    if (uAge > 0 && uAge <= 120) {
                        let ageTitle = rtlTxt.ageTitle[uGenderKey][uAgeCategory]

                        this.storage.addOpenAIHistoryText("system",
                            formatMessage(
                                rtlTxt.system.generateObservationAnalysis[uGenderKey][0],
                                { uName: uName, ageTitle: ageTitle, uAge: uAge }));
                    }

                    this.storage.addOpenAIHistoryText("system",
                        formatMessage(
                            rtlTxt.system.generateObservationAnalysis[uGenderKey][1],
                            {
                                uName: uName,
                                u2Name: u2Name,
                                _topic: topic === "" ? "" : formatMessage(rtlTxt.system.observationTopicPhrase, { topic: topic }),
                                _subTopic: subTopic === "" ? "" : formatMessage(rtlTxt.system.observationSubTopicPhrase, { subTopic: subTopic }),
                                u2Relationship: u2Relationship
                            }
                        )
                    );

                    this.storage.addOpenAIHistoryText("system",
                        rtlTxt.system.generateObservationAnalysis[uGenderKey][2]);

                    this.storage.addOpenAIHistoryText("system",
                        formatMessage(rtlTxt.system.generateObservationAnalysis[uGenderKey][3], { uName: uName }));

                    this.storage.addOpenAIHistoryText("system",
                        rtlTxt.system.generateObservationAnalysis[uGenderKey][4]);
                }

                return {
                    response_format: zodResponseFormat(z.object({
                        request_for_more_info: z.union([z.string().describe(rtlTxt.zodFieldDescription.observation.requestForMoreInfo), z.null()]),
                        observation: z.union([z.string().describe(rtlTxt.zodFieldDescription.observation.theObservation), z.null()])
                    }), "observation"),
                    max_tokens: 600,
                    temperature: 0.7
                };

            case UserMessagePhase.BE_FeelingsProbe:
                if (phaseCount === 0) {
                    this.storage.addOpenAIHistoryText("system",
                        formatMessage(rtlTxt.system.feelingsProbe[uGenderKey], { uName: uName }));
                }
                return {
                    response_format: zodResponseFormat(z.object({
                        feelings: FeelingsArray
                        // description: z.string()
                    }), "feelings-intensities"),
                    max_tokens: 600,
                    temperature: 0.7
                };
            case UserMessagePhase.BE_FeelingsAnalysis:

                break;
            case UserMessagePhase.BE_NeedsProbe:

                break;
            case UserMessagePhase.TBD:

                break;
            default:
                throw Error('Invalid User Message Phase');
        }
    }

    addUserInputToOpenAIHistory = (userText: string) => {
        this.storage.addOpenAIHistoryText("user", userText);
    }

    private determineNextPhaseOnOK = (phase: UserMessagePhase) => {
        const { userInRelationship } = (this.storage as ExtendedStorage)?.getState();
        let next_phase = phase

        switch (phase) {

            case UserMessagePhase.BE_PersonInConflictRelation:
                if (relationships({ category: RelationshipCategory.Parents }).includes(
                    userInRelationship.data?.relationship as string)) {
                    next_phase = UserMessagePhase.BE_ObservationAnalysis;
                }
                else {
                    next_phase = UserMessagePhase.BE_PersonInConflictName;
                }
                break;
            case UserMessagePhase.BE_PersonInConflictName:
                if (relationships({ category: RelationshipCategory.SiblingsOrChildren }).includes(
                    userInRelationship.data?.relationship as string)) {
                    next_phase = UserMessagePhase.BE_PersonInConflictAge;
                }
                else {
                    next_phase = UserMessagePhase.BE_ObservationAnalysis;
                }
                break;
            case UserMessagePhase.BE_PersonInConflictAge:
                next_phase = UserMessagePhase.BE_ObservationAnalysis;
                break;
            case UserMessagePhase.BE_FeelingsProbe:
                next_phase = UserMessagePhase.TBD;
                break;
            default:
                break;
        }
        return next_phase;
    }

    private updatePhase = (nextPhase: UserMessagePhase) => {
        const { phase, phaseCount } = (this.storage as ExtendedStorage)?.getState();
        if (nextPhase === phase) {
            this.storage?.setPhaseCount(phaseCount + 1);
        }
        else {
            this.storage?.setPhase(nextPhase);
            this.storage?.setPhaseCount(0);
        }
    }

    private generateFollowUpText = (phase: UserMessagePhase): string => {
        const { currentUser, userInRelationship } = (this.storage as ExtendedStorage)?.getState();

        let uGender = currentUser?.data.gender;
        let uGenderKey = genderKey(uGender);

        let u2Gender = userInRelationship?.data?.gender;
        let u2GenderKey = genderKey(u2Gender);

        switch (phase) {
            case UserMessagePhase.BE_PersonInConflictName:
                return rtlTxt.chat.askWhatIsTheNameOfPersonInConflict[u2GenderKey];
            case UserMessagePhase.BE_ObservationAnalysis:
                return rtlTxt.chat.callForSituationInfo[uGenderKey];
            case UserMessagePhase.BE_PersonInConflictAge:
                return rtlTxt.chat.askHowOldPersonInConflict[u2GenderKey];
            default:
                return ``;
        }
    }

    buildBotResponse = (bot_msg: { parsed: Object | null, refusal: string | null }) => {
        const { phase, currentUser, userInRelationship } = (this.storage as ExtendedStorage)?.getState();

        let uName = currentUser?.firstName as string;
        let uGender = currentUser?.data.gender;
        let uGenderKey = genderKey(uGender);
        let uAge = currentUser?.data.age;
        let uAgeCategory = ageCategory(uAge);

        let u2Gender = userInRelationship?.data?.gender;
        let u2GenderKey = genderKey(u2Gender);

        let more_input_required = true

        let replys: Array<MsgContentData> = []
        let addReply = (
            { content, content_type = MessageContentType.TextHtml }: MsgContentData) => {
            replys.push({ content: content, content_type: content_type })
        }

        let assistant_msg;
        let next_phase = phase;

        if (bot_msg?.parsed) {

            let parsed_msg = Object(bot_msg.parsed)

            switch (phase) {

                case UserMessagePhase.BE_PersonInConflictRelation:

                    if (!parsed_msg.person_in_conflict_info) {

                        addReply({ content: rtlTxt.chat.complainAboutPersonInConflictRelationIsIncomplete[uGenderKey][uAgeCategory] })
                        assistant_msg = replys[0].content
                    }
                    else {
                        more_input_required = false;

                        let uir_data = userInRelationship.data as UserInRelationshipData
                        let info = parsed_msg.person_in_conflict_info;
                        uir_data.relationship = info.relationship_to_user;
                        uir_data.gender = info.gender;
                        userInRelationship.data = uir_data;
                        assistant_msg = formatMessage(
                            rtlTxt.chat.answerPersonInConflictRelation[u2GenderKey],
                            { u2Relationship: info.relationship_to_user, uName: uName });
                        next_phase = this.determineNextPhaseOnOK(phase);
                        addReply({ content: this.generateFollowUpText(next_phase) });
                    }
                    // assistant_msg = replys[0].content
                    break;

                case UserMessagePhase.BE_PersonInConflictName:
                    if (!parsed_msg.first_name) {
                        addReply({ content: rtlTxt.chat.complainAboutPersonInConflictName[uGenderKey][u2GenderKey] })
                        assistant_msg = replys[0].content

                    } else {
                        more_input_required = false;
                        userInRelationship.firstName = parsed_msg.first_name;
                        assistant_msg = formatMessage(
                            rtlTxt.chat.answerPersonInConflictName[u2GenderKey], { u2Name: parsed_msg.first_name });
                        next_phase = this.determineNextPhaseOnOK(phase);
                        addReply({ content: this.generateFollowUpText(next_phase) });
                    }

                    // assistant_msg = replys[0].content
                    break;

                case UserMessagePhase.BE_PersonInConflictAge:
                    if (!parsed_msg.age) {
                        addReply({ content: rtlTxt.chat.complainAboutPersonInConflictAge[u2GenderKey] })
                        assistant_msg = replys[0].content
                    } else {
                        more_input_required = false;

                        (userInRelationship.data as UserInRelationshipData).age = parsed_msg.age;
                        assistant_msg = formatMessage(
                            rtlTxt.chat.answerPersonInConflictAge[uGenderKey], { u2Age: parsed_msg.age });
                        next_phase = this.determineNextPhaseOnOK(phase);

                        addReply({ content: this.generateFollowUpText(next_phase) })
                    }

                    // assistant_msg = replys[0].content
                    break;

                case UserMessagePhase.BE_ObservationAnalysis:
                    if (!parsed_msg.observation) {
                        addReply({ content: parsed_msg.request_for_more_info })
                        assistant_msg = replys[0].content
                    }
                    else {

                        more_input_required = false;
                        // phase is unknown at that point because the user can decide he is not 
                        // satisfied with the given observation and keep feeding more information
                        // next_phase = UserMessagePhase.Unknown;

                        addReply({
                            content: parsed_msg.observation,
                            content_type: MessageContentType.TextPlain
                        })
                        addReply({
                            content: { id: "observation_approval", observation: parsed_msg.observation },
                            content_type: MessageContentType.Other
                        })

                        // assistange message is generated once the user approves the observation
                        // assistant_msg = ?
                    }
                    break;

                case UserMessagePhase.BE_FeelingsProbe:
                    more_input_required = false;
                    next_phase = this.determineNextPhaseOnOK(phase);

                    addReply({
                        content: rtlTxt.chat.feelingsAdjustmentGuidelines[uGenderKey]
                    })
                    addReply({
                        content: { ...parsed_msg, id: "feelings", active: true },
                        content_type: MessageContentType.Other
                    })

                    assistant_msg = rtlTxt.chat.feelingsAssessmentIntro[uGenderKey].concat(
                        Object(parsed_msg).feelings.map(
                            (s: Object) => {
                                return formatMessage(rtlTxt.chat.feelingAssessment, {
                                    emotionName: Object(s).emotion_name,
                                    emotionIntensity: Object(s).emotion_intensity
                                })
                            }
                        ).join(' ')
                    )

                    // assistant_msg = `להערכתי ${uPoS.sbj2ndPronoun} מרגיש${uPoS.Hei} את התחושות הבאות בסולם של אחת עד עשר: 
                    //                 ${Object(parsed_msg).feelings.map(
                    //     (s: Object) => {
                    //         return ` ${Object(s).emotion_name} בעוצמה ${Object(s).emotion_intensity} `
                    //     }
                    // ).join(' ')}`
                    break;
                case UserMessagePhase.BE_FeelingsAnalysis:

                    break;
                case UserMessagePhase.BE_NeedsProbe:

                    break;
                case UserMessagePhase.TBD:

                    break;
                default:
                    throw Error('Invalid User Message Phase');
            }

        } else if (bot_msg?.refusal) {
            // handle refusal
            addReply({ content: bot_msg.refusal })
            assistant_msg = replys[0].content
        }

        this.storage.setMoreUserInputRequired(more_input_required);
        this.storage.setUserInRelationship(userInRelationship);

        if (assistant_msg) {
            this.storage.addOpenAIHistoryText("assistant", assistant_msg);
        }

        this.updatePhase(next_phase)

        this.updateState();

        return replys;
    }

}