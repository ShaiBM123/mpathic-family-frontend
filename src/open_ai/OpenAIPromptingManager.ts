// import React, { useState } from 'react';
import { z } from 'zod';
import type { infer as zodInfer, ZodType } from 'zod';
import { zodResponseFormat } from 'openai/helpers/zod';
import {AutoParseableResponseFormat} from 'openai/lib/parser';
import { ExtendedStorage } from "../data/ExtendedStorage";
import { UserMessagePhase } from './OpenAITypes';
import { UserInRelationshipData } from "../data/UserInRelationshipData";
import { UpdateState } from "@chatscope/use-chat/dist/Types";
import { MessageContentType } from "@chatscope/use-chat/dist/enums";
import { User } from "@chatscope/use-chat";
// import { MessageContent } from "@chatscope/use-chat/dist/interfaces";
import {ChatModel} from "openai/resources";
import { RelationshipCategory, Gender } from '../data/data';
import {relationships} from './PersonalRelationships';
import {FeelingsArray} from '../components/feelings-scale/FeelingsScale';

export type SyestemPromptData = { 
    response_format: AutoParseableResponseFormat<zodInfer<ZodType>>,
    max_tokens: number,
    temperature: number 
} | undefined

export function completeUserPartOfSpeech(user: User) {
    let gender = user?.data?.gender;
    if (gender)
    {
        return{
            sbj3rdPronoun: user.data.gender===Gender.Female? "היא":"הוא",
            sbj2ndPronoun: user.data.gender===Gender.Female? "את":"אתה",
            objPronoun: user.data.gender===Gender.Female? "לה":"לו",
            possessiveAdj: user.data.gender===Gender.Female? "שלה":"שלו",
            Taf: user.data.gender===Gender.Female? "ת":"",
            Yod: user.data.gender===Gender.Female? "י":"",
            VavOrHei: user.data.gender===Gender.Female? "ה":"ו",
            YodOrHei: user.data.gender===Gender.Female? "י":"ה",
            Hei: user.data.gender===Gender.Female? "ה":""
        }
    }
    return {}
}

export class OpenAIPromptManager{
    private storage: ExtendedStorage;
    private updateState: UpdateState;
    model: (string & {}) | ChatModel;

    constructor(storage: ExtendedStorage, update: UpdateState) {
        this.storage = storage;
        this.updateState = update;
        this.model ="gpt-4o-mini"; 
    }

    buildSyestemPrompt = (): SyestemPromptData => 
    {
        const {phase, phaseCount, topic, subTopic, currentUser, userInRelationship} = this.storage?.getState();
        
        let uName = currentUser?.firstName;
        let uGender = currentUser?.data.gender;
        let uPoS = completeUserPartOfSpeech(currentUser as User);

        let u2Name = userInRelationship.firstName;
        // let u2Gender = userInRelationship?.data?.gender;
        let u2Relationship = userInRelationship.data?.relationship;
        // let u2PoS = completeUserPartOfSpeech(userInRelationship as User);

        switch (phase) {

            case UserMessagePhase.PersonInConflictIdentity:
                if(phaseCount === 0)
                {
                    this.storage.addOpenAIHistoryText(
                        "system", 
                        `בטקסט הבא המשתמש${uPoS.Taf} ${uName} מתאר${uPoS.Taf} אל מי ${uPoS.sbj3rdPronoun} מתייחס${uPoS.Taf}, במידה וניתן עליך לזהות את הקרבה של המשתמש${uPoS.Taf} אל אותו אדם, את מינו (זכר או נקבה) ואת השם הפרטי שלו או שלה`);

                }
                
                return {
                    
                    response_format: zodResponseFormat( z.object({
                        person_in_conflict_info: z.union([
                            z.object({
                                relationship:
                                z.union([
                                    z.object({
                                        gender_of_person_in_conflict: z.enum(["נקבה"]), 
                                        relationship_to_person_in_conflict: 
                                        // z.union([
                                            z.enum(relationships({gender: Gender.Female}) as [string, ...string[]])
                                            .describe(`הקרבה אל הגברת, הבחורה או הילדה אליה המשתמש${uPoS.Taf} מתייחס${uPoS.Taf}`), 
                                            // z.null()]),
                                    }), 
                                    z.object({
                                        gender_of_person_in_conflict: z.enum(["זכר"]), 
                                        relationship_to_person_in_conflict: 
                                        // z.union([
                                            z.enum(relationships({gender: Gender.Male}) as [string, ...string[]])
                                            .describe(`הקרבה אל האדון, הבחור או הילד אליו המשתמש${uPoS.Taf} מתייחס${uPoS.Taf}`)
                                            // z.null()]),
                                    }), z.null()]),
                                    gender_of_person_in_conflict: z.enum(["זכר","נקבה"]),
                                    first_name:  z.union([z.string().describe("שם פרטי"), z.null()])

                            }), z.null()]),

                    }), "person_in_conflict"), 

                    max_tokens: 200,
                    temperature: 0.7
                };

            case UserMessagePhase.PersonInConflictNickname:
                if(phaseCount === 0)
                {
                    this.storage.addOpenAIHistoryText("system", `עליך לזהות בטקסט הבא את כינוי החיבה של ${u2Name}`)
                }

                return {
                    response_format: zodResponseFormat( z.object({ 
                        nickname:  z.union([z.string().describe("כינוי חיבה"), z.null()]),
                    }), "nickname_of_the_person_in_conflict"),                 
                    max_tokens: 200,
                    temperature: 0.7
                };
          
            case UserMessagePhase.PersonInConflictAge:
                if(phaseCount === 0)
                {
                    this.storage.addOpenAIHistoryText("system", `במשפט הבא עליך לזהות את גילו של ${u2Name}`)
                }

                return {
                    response_format: zodResponseFormat( z.object({
                        age: z.union([z.number().describe("גיל"), z.null()]),
                    }), "age_of_the_person_in_conflict"),                 
                    max_tokens: 200,
                    temperature: 0.7
                };
            case UserMessagePhase.ObservationAnalysis:
                if(phaseCount === 0)
                {
                    this.storage.addOpenAIHistoryText("system", 
                        `בהנתן התיאור של ${uName} לגבי סיטואציה` +
                        (topic === "" ? `` : ` בנושא ${topic}`) + 
                        (subTopic === "" ?`` : ` ובפרט לגבי ${subTopic}`) +
                        ` מול ${u2Name} ה${u2Relationship} ${uPoS.possessiveAdj} נסח תצפית לפי הגישה של תקשורת מקרבת`);
                    this.storage.addOpenAIHistoryText("system", 
                        'תצפית מוגדרת כהתמקדות במה שאנחנו רואים שומעים או מבחינים בו באופן אובייקטיבי מבלי להוסיף רגש, שיפוט, פרשנות או הערכה');    
                    this.storage.addOpenAIHistoryText("system", 
                        `נסח את התצפית בגוף שני כך שהניסוח פונה ל ${uName}`);
                }

                return {
                    response_format: zodResponseFormat( z.object({
                        request_for_more_info: z.union([z.string().describe("בקשה למידע נוסף להשלמת ניסוח התצפית"), z.null()]), 
                        observation: z.union([z.string().describe("התצפית"), z.null()])
                    }), "observation"),                 
                    max_tokens: 600,
                    temperature: 0.7
                };

            case UserMessagePhase.FeelingsProbe:
                if(phaseCount === 0)
                {
                    this.storage.addOpenAIHistoryText("system", 
                        `בהתבסס על התיאור של המשתמש${uPoS.Taf} ${uName}, מצא עד שלושה רגשות דומיננטיים המובעים בטקסט ותאר בקצרה את הלך הרוח מההבט הרגשי`);
                }
                return {
                    response_format: zodResponseFormat( z.object({
                        feelings: FeelingsArray, 
                        description: z.string()
                    }), "feelings-intensities"),                 
                    max_tokens: 600,
                    temperature: 0.7
                };
            case UserMessagePhase.FeelingsAnalysis:

                break;
            case UserMessagePhase.NeedsProbe:

                break;
            case UserMessagePhase.TBD:

                break;
            default:
                throw Error('Invalid User Message Phase');
        }
    }

    addUserInputToOpenAIHistory = (userText: string)=>{
        this.storage.addOpenAIHistoryText("user", userText);
    }

    private updatePhase = (nextPhase: UserMessagePhase, phaseCount: number) => {
        this.storage?.setPhase(nextPhase);
        this.storage?.setPhaseCount(phaseCount);
    }

    private generateInitialFollowUpText = (phase: UserMessagePhase): string => {
        const {currentUser, userInRelationship} = (this.storage as ExtendedStorage)?.getState();
        let uPoS = completeUserPartOfSpeech(currentUser as User);
        let u2Gender = userInRelationship?.data?.gender;
        let u2PoS = completeUserPartOfSpeech(userInRelationship as User);
    
        switch (phase) {
    
            case UserMessagePhase.PersonInConflictIdentity:      
                return ``;
            case UserMessagePhase.ObservationAnalysis:
                return `תודה! תאר${uPoS.Yod} את הסיטואציה עליה ${uPoS.sbj2ndPronoun} מדבר${uPoS.Taf}, מה קרה בעצם ? אני סקרן אז כמה שיותר פרטים בבקשה !`;
            case UserMessagePhase.PersonInConflictNickname:
                return `מהו כינוי החיבה של${u2PoS.VavOrHei} ?`;
            case UserMessagePhase.PersonInConflictAge:
                return `${u2Gender === Gender.Female ? "בת":"בן"} כמה ${u2PoS.sbj3rdPronoun} ?`;
            case UserMessagePhase.FeelingsProbe:
                return ``;
            case UserMessagePhase.FeelingsAnalysis:
                return ``;
            case UserMessagePhase.NeedsProbe:
                return ``;
            case UserMessagePhase.TBD:
                return ``;
            default:
                throw Error('Invalid User Message Phase');
        }
    }

    buildBotResponse = (bot_msg: {parsed: Object | null, refusal: string | null})  => 
    {
        const {phase, phaseCount, currentUser, userInRelationship} = (this.storage as ExtendedStorage)?.getState();

        // let uName = currentUser?.firstName;
        let uGender = currentUser?.data.gender;
        let uPoS = completeUserPartOfSpeech(currentUser as User);

        // let u2Name = userInRelationship.firstName;
        let u2Gender = userInRelationship?.data?.gender;
        // let u2Relationship = userInRelationship.data?.relationship;
        let u2PoS = completeUserPartOfSpeech(userInRelationship as User);

        let info_required = true
        let content: any = null
        let assistant_msg;
        let content_type = MessageContentType.TextPlain

        let next_phase = null;

        if (bot_msg?.parsed) {

            let parsed_msg = Object(bot_msg.parsed)

            switch (phase) {

                case UserMessagePhase.PersonInConflictIdentity:

                    if(!parsed_msg.person_in_conflict_info)
                    {
                        this.updatePhase(phase, phaseCount+1)
                        content =  `לא הצלחתי להבין, למי בדיוק ${uPoS.sbj2ndPronoun} מתייחס${uPoS.Taf} ומה שמו או שמה`
                    }
                    else if(!parsed_msg.person_in_conflict_info.relationship) {
                        this.updatePhase(phase, phaseCount+1)
                        content =  ` לא הבנתי, למי ${uPoS.sbj2ndPronoun} מתייחס${uPoS.Taf} (${uGender === Gender.Male ? "בת":"בן"} זוג, אח, אחות וכד)`
                    
                    }else if(!parsed_msg.person_in_conflict_info.first_name) {
                        this.updatePhase(phase, phaseCount+1)
                        let gender_of_pic = parsed_msg.person_in_conflict_info.gender_of_person_in_conflict
                        content =`${uGender === Gender.Female ? "רשמי":"רשום"} את ${gender_of_pic === Gender.Female ? "שמה":"שמו"}`;
                    }
                    else {
                        let uir_data = userInRelationship.data as UserInRelationshipData
                        uir_data.relationship = parsed_msg.person_in_conflict_info.relationship.relationship_to_person_in_conflict;
                        let gender = parsed_msg.person_in_conflict_info.gender_of_person_in_conflict; 
                        uir_data.gender = 
                            gender === "זכר" ? Gender.Male : 
                            gender === "נקבה" ? Gender.Female : 
                            Gender.Other;
                        userInRelationship.data = uir_data;
                        userInRelationship.firstName = parsed_msg.person_in_conflict_info.first_name;

                        info_required = false;

                        if(relationships({category: RelationshipCategory.Family}).includes(
                            userInRelationship.data?.relationship as string))
                        {
                            next_phase = UserMessagePhase.PersonInConflictAge;
                            this.updatePhase(next_phase, 0);
                            content = this.generateInitialFollowUpText(next_phase);
                        }
                        else if(relationships({category: RelationshipCategory.Friends}).includes(
                            userInRelationship.data?.relationship as string))
                        {
                            next_phase = UserMessagePhase.PersonInConflictNickname;
                            this.updatePhase(next_phase, 0);
                            content = this.generateInitialFollowUpText(next_phase);
                        }
                        else{
                            next_phase = UserMessagePhase.ObservationAnalysis;
                            this.updatePhase(next_phase, 0);
                            content = this.generateInitialFollowUpText(next_phase);
                        }
                    }
                    assistant_msg = content
                    break;

                case UserMessagePhase.PersonInConflictNickname:
                    if(! parsed_msg.nickname) {
                        content = `לא הבנתי אותך :-( ${uGender === Gender.Female ? "רשמי":"רשום"} את כינוי החיבה ${u2PoS.possessiveAdj}`  

                    } else {
                        (userInRelationship.data as UserInRelationshipData).nickName = parsed_msg.nickname;
                        info_required = false

                        next_phase = UserMessagePhase.ObservationAnalysis;
                        this.updatePhase(next_phase, 0)
                        content = this.generateInitialFollowUpText(next_phase);
                    }
                    assistant_msg = content
                    break;

                case UserMessagePhase.PersonInConflictAge:
                    if(!parsed_msg.age) {
                        content = `לא הבנתי אותך :-( מהו ${u2Gender === Gender.Female ? "גילה":"גילו"} ?`

                    } else {
                        (userInRelationship.data as UserInRelationshipData).age = parsed_msg.age;
                        info_required = false

                        if(relationships({category: RelationshipCategory.Family}).includes(
                            userInRelationship.data?.relationship as string))
                        {
                            next_phase = UserMessagePhase.PersonInConflictNickname;
                            this.updatePhase(next_phase, 0)
                            content = this.generateInitialFollowUpText(next_phase);
                        }
                        else{
                            next_phase = UserMessagePhase.ObservationAnalysis;
                            this.updatePhase(next_phase, 0)
                            content = this.generateInitialFollowUpText(next_phase);
                        }
                    }
                    assistant_msg = content
                    break;

                case UserMessagePhase.ObservationAnalysis:
                    if(!parsed_msg.observation) {
                        content = parsed_msg.request_for_more_info
                        assistant_msg = content
                    } 
                    else {
                        info_required = false
                        content_type = MessageContentType.Other
                        // phase is unknown at that point because the user can decide he is not 
                        // satisfied with the given observation and keep feeding more information
                        this.updatePhase(UserMessagePhase.Unknown, 0)
                        content = {observation: parsed_msg.observation, id: "observation", active: true, isCorrect: null}
                        // assistange message is generated once the user approves the observation
                        // assistant_msg = ?
                    }
                    break;

                case UserMessagePhase.FeelingsProbe:
                    info_required = false
                    content_type = MessageContentType.Other
                    this.updatePhase(UserMessagePhase.TBD, 0)
                    content = {...parsed_msg, id: "feelings", active: true}
                    assistant_msg = `להערכתי ${uPoS.sbj2ndPronoun} מרגיש${uPoS.Hei} את התחושות הבאות בסולם של אחת עד עשר: 
                                    ${Object(parsed_msg).feelings.map(
                                        (s: Object)=>{
                                            return ` ${Object(s).emotion_name} בעוצמה ${Object(s).emotion_intensity} `
                                        }
                                    ).join(' ')}` 
                    break;
                case UserMessagePhase.FeelingsAnalysis:
    
                    break;
                case UserMessagePhase.NeedsProbe:
    
                    break;
                case UserMessagePhase.TBD:
    
                    break;
                default:
                    throw Error('Invalid User Message Phase');
            }   
            

        } else if (bot_msg?.refusal) {
            // handle refusal
            info_required = true 
            content = bot_msg.refusal
            assistant_msg = content
        }

        this.storage?.setUserInRelationship(userInRelationship);
        this.updateState();

        if(assistant_msg){
            this.storage.addOpenAIHistoryText("assistant", assistant_msg);
        }
        if (info_required === true ){
            this.updatePhase(phase, phaseCount+1)
        }

        return { content: content, content_type: content_type, more_info_required: info_required };
    }

}