// import React, { useState } from 'react';
import { z } from 'zod';
import type { infer as zodInfer, ZodType } from 'zod';
import { zodResponseFormat } from 'openai/helpers/zod';
import {AutoParseableResponseFormat} from 'openai/lib/parser';
import { ExtendedStorage } from "../data/ExtendedStorage";
import { UserMessagePhase, MsgContentData } from './OpenAITypes';
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

    private updatePhase = (nextPhase: UserMessagePhase) => {
        const {phase, phaseCount} = (this.storage as ExtendedStorage)?.getState();
        if(nextPhase === phase){
            this.storage?.setPhaseCount(phaseCount + 1);
        }
        else{
            this.storage?.setPhase(nextPhase);
            this.storage?.setPhaseCount(0);
        }

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

    buildBotResponse = (bot_msg: {parsed: Object | null, refusal: string | null}) => 
    {
        const {phase, currentUser, userInRelationship} = (this.storage as ExtendedStorage)?.getState();

        // let uName = currentUser?.firstName;
        let uGender = currentUser?.data.gender;
        let uPoS = completeUserPartOfSpeech(currentUser as User);

        // let u2Name = userInRelationship.firstName;
        let u2Gender = userInRelationship?.data?.gender;
        // let u2Relationship = userInRelationship.data?.relationship;
        let u2PoS = completeUserPartOfSpeech(userInRelationship as User);

        let more_input_required = true

        let replys:Array<MsgContentData> = []
        let addReply = (
            {content, content_type = MessageContentType.TextPlain}: MsgContentData) =>
        {
            replys.push({content: content, content_type: content_type})
        }

        let assistant_msg;
        let next_phase = phase;

        if (bot_msg?.parsed) {

            let parsed_msg = Object(bot_msg.parsed)

            switch (phase) {

                case UserMessagePhase.PersonInConflictIdentity:

                    if(!parsed_msg.person_in_conflict_info)
                    {
                        addReply({content: `לא הצלחתי להבין, למי בדיוק ${uPoS.sbj2ndPronoun} מתייחס${uPoS.Taf} ומה שמו או שמה`})
                    }
                    else if(!parsed_msg.person_in_conflict_info.relationship) {

                        addReply({content:` לא הבנתי, למי ${uPoS.sbj2ndPronoun} מתייחס${uPoS.Taf} (${uGender === Gender.Male ? "בת":"בן"} זוג, אח, אחות וכד)`})
                    
                    }else if(!parsed_msg.person_in_conflict_info.first_name) {

                        let gender_of_pic = parsed_msg.person_in_conflict_info.gender_of_person_in_conflict
                        addReply({content: `${uGender === Gender.Female ? "רשמי":"רשום"} את ${gender_of_pic === Gender.Female ? "שמה":"שמו"}`});
                    }
                    else {
                        more_input_required = false;

                        let uir_data = userInRelationship.data as UserInRelationshipData
                        uir_data.relationship = parsed_msg.person_in_conflict_info.relationship.relationship_to_person_in_conflict;
                        let gender = parsed_msg.person_in_conflict_info.gender_of_person_in_conflict; 
                        uir_data.gender = 
                            gender === "זכר" ? Gender.Male : 
                            gender === "נקבה" ? Gender.Female : 
                            Gender.Other;
                        userInRelationship.data = uir_data;
                        userInRelationship.firstName = parsed_msg.person_in_conflict_info.first_name;

                        if(relationships({category: RelationshipCategory.Family}).includes(
                            userInRelationship.data?.relationship as string))
                        {
                            next_phase = UserMessagePhase.PersonInConflictAge;
                        }
                        else if(relationships({category: RelationshipCategory.Friends}).includes(
                            userInRelationship.data?.relationship as string))
                        {
                            next_phase = UserMessagePhase.PersonInConflictNickname;
                        }
                        else{
                            next_phase = UserMessagePhase.ObservationAnalysis;
                        }

                        addReply({content:this.generateInitialFollowUpText(next_phase)});
                        
                    }
                    assistant_msg = replys[0].content
                    break;

                case UserMessagePhase.PersonInConflictNickname:
                    if(! parsed_msg.nickname) {
                        addReply({content: `לא הבנתי אותך :-( ${uGender === Gender.Female ? "רשמי":"רשום"} את כינוי החיבה ${u2PoS.possessiveAdj}` })

                    } else {
                        more_input_required = false;

                        (userInRelationship.data as UserInRelationshipData).nickName = parsed_msg.nickname;

                        next_phase = UserMessagePhase.ObservationAnalysis;

                        addReply({content: this.generateInitialFollowUpText(next_phase)});
                    }

                    assistant_msg = replys[0].content
                    break;

                case UserMessagePhase.PersonInConflictAge:
                    if(!parsed_msg.age) {
                        addReply({content: `לא הבנתי אותך :-( מהו ${u2Gender === Gender.Female ? "גילה":"גילו"} ?`})

                    } else {
                        more_input_required = false;

                        (userInRelationship.data as UserInRelationshipData).age = parsed_msg.age;

                        if(relationships({category: RelationshipCategory.Family}).includes(
                            userInRelationship.data?.relationship as string))
                        {
                            next_phase = UserMessagePhase.PersonInConflictNickname;
                        }
                        else{
                            next_phase = UserMessagePhase.ObservationAnalysis;
                        }

                        addReply({content: this.generateInitialFollowUpText(next_phase)})
                    }
                    
                    assistant_msg = replys[0].content
                    break;

                case UserMessagePhase.ObservationAnalysis:

                    if(!parsed_msg.observation) {

                        addReply({content: parsed_msg.request_for_more_info})
                        assistant_msg = replys[0].content
                    } 
                    else {

                        more_input_required = false;
                        // phase is unknown at that point because the user can decide he is not 
                        // satisfied with the given observation and keep feeding more information
                        // next_phase = UserMessagePhase.Unknown;

                        addReply({
                            content: {
                                observation: parsed_msg.observation, 
                                id: "observation", 
                                active: true, 
                                isCorrect: null
                            }, 
                            content_type:  MessageContentType.Other})
                        
                        // assistange message is generated once the user approves the observation
                        // assistant_msg = ?
                    }
                    break;

                case UserMessagePhase.FeelingsProbe:

                    more_input_required = false;
                    next_phase = UserMessagePhase.TBD;

                    addReply({
                        content: ` מה ${uPoS.sbj2ndPronoun} מרגיש${uPoS.Hei} בעקבות הארוע ? אנא ${uGender === Gender.Female ? "כווני":"כוון"} את עוצמות הרגש בהתאם ל${uGender === Gender.Female ? "חוויותיך":"חוויותך"} האישיות ע"י גרירת העיגול על גבי הסרגל המתאים. מחק${uPoS.Yod} רגשות לא רלוונטים ע"י לחיצה על x ${uGender === Gender.Female ? "הוסיפי":"הוסף"} רגשות ע"י לחיצה על +`})
                    addReply({
                        content: {...parsed_msg, id: "feelings", active: true}, 
                        content_type:  MessageContentType.Other})

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
            addReply({ content:  bot_msg.refusal })
            assistant_msg = replys[0].content
        }

        this.storage.setMoreUserInputRequired(more_input_required);
        this.storage.setUserInRelationship(userInRelationship);

        if(assistant_msg){
            this.storage.addOpenAIHistoryText("assistant", assistant_msg);
        }

        this.updatePhase(next_phase)

        this.updateState();

        return replys;
    }

}