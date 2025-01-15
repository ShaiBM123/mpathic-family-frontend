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
import { Gender } from '../data/data';
import {FeelingsArray} from '../components/feelings-scale/FeelingsScale';

export type SyestemPromptData = { 
    response_format: AutoParseableResponseFormat<zodInfer<ZodType>>,
    max_tokens: number,
    temperature: number 
} | undefined

export function completeUserPartOfSpeech(user: User) {
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

export class OpenAIPromptManager{
    private storage: ExtendedStorage;
    private updateState: UpdateState;
    model: (string & {}) | ChatModel;
    history: Array<{role: string, content: string }>;

    constructor(storage: ExtendedStorage, update: UpdateState) {
        this.storage = storage;
        this.updateState = update;
        this.model ="gpt-4o-mini"; 

        this.history = [{
            role: "system",
            content: "אתה מטפל בשיטת התקשורת המקרבת התפקיד שלך הוא לסייע למשתמשים ליישב בעיות בין אישיות בצורה אמפתית בשפה העברית.",
        }]
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

            case UserMessagePhase.PersonInConflictRelationship:
                if(phaseCount === 0)
                {
                    this.history.push(
                        { role: "system", content: `במשפט הבא המשתמש${uPoS.Taf} ${uName} מתאר${uPoS.Taf} אל מי ${uPoS.sbj3rdPronoun} מתייחס${uPoS.Taf}, עליך לזהות את הקרבה של המשתמש${uPoS.Taf} אל אותו אדם ואת מינו (זכר או נקבה)`});
                }

                return {
                    
                    response_format: zodResponseFormat( z.object({
                        person_in_conflict_info: z.union([
                            z.object({
                                relationship: z.union([
                                    z.enum([
                                        "בת משפחה", "בן משפחה",
                                        "בת", "בן",
                                        "נכדה", "נכד",
                                        "בת דוד", "בן דוד",
                                        "דודה", "דוד",
                                        "אחות", "אח",
                                        "אחיינית", "אחיין", 
                                        "אישה", "בעל", 
                                        "חברה", "חבר", 
                                        "ידידה", "ידיד",
                                        "בוסית", "בוס", 
                                        "עמיתה לעבודה", "עמית לעבודה",  
                                        "שכנה", "שכן",
                                        "מורה", "מורה", 
                                        "מדריכה", "מדריך",
                                        "אחר"]), z.null()]), 
                                gender: z.union([z.enum(["זכר", "נקבה"]), z.null()])
                            }), z.null()]),
                    }), "relationship_to_the_person_in_conflict"),                 
                    max_tokens: 200,
                    temperature: 0.7
                };
     
            case UserMessagePhase.PersonInConflictName:
                if(phaseCount === 0)
                {
                    this.history.push(
                        { role: "system", content: `עליך לזהות בטקסט הבא את שמו הפרטי של האדם אליו ${uName} מתייחס`})
                }

                return {                    
                    response_format: zodResponseFormat( z.object({
                        name:  z.union([z.string(), z.null()]).describe("שם פרטי"),
                    }), "name_of_the_person_in_conflict"),                 
                    max_tokens: 200,
                    temperature: 0.7
                };

            case UserMessagePhase.PersonInConflictNickname:
                if(phaseCount === 0)
                {
                    this.history.push(
                        { role: "system", content: `עליך לזהות בטקסט הבא את כינוי החיבה של ${u2Name}`})
                }

                return {
                    response_format: zodResponseFormat( z.object({ 
                        nickname:  z.union([z.string(), z.null()]).describe("כינוי חיבה"),
                    }), "nickname_of_the_person_in_conflict"),                 
                    max_tokens: 200,
                    temperature: 0.7
                };
          
            case UserMessagePhase.PersonInConflictAge:
                if(phaseCount === 0)
                {
                    this.history.push(
                        { role: "system", content: `במשפט הבא עליך לזהות את גילו של ${u2Name}`})
                }

                return {
                    response_format: zodResponseFormat( z.object({
                        age: z.union([z.number(), z.null()]),
                    }), "age_of_the_person_in_conflict"),                 
                    max_tokens: 200,
                    temperature: 0.7
                };
            case UserMessagePhase.ObservationAnalysis:
                if(phaseCount === 0)
                {
                    this.history.push(
                        { role: "system", content: `בהנתן תיאור של ${uName} לגבי סיטואציה בנושא  ${topic} בכל מה שקשור ב ${subTopic} מול ${u2Name} ה${u2Relationship} ${uPoS.possessiveAdj} נסח תצפית לפי הגישה של תקשורת מקרבת`},
                        { role: "system", content: 'תצפית מוגדרת כהתמקדות במה שאנחנו רואים שומעים או מבחינים בו באופן אובייקטיבי מבלי להוסיף רגש, שיפוט, פרשנות או הערכה'},
                        { role: "system", content: `אם התיאור של ${uName} מלא נסח תצפית אחרת בקש ${uGender===Gender.Female? "ממנה":"ממנו"} פרטים נוספים`},
                        { role: "system", content: `${uName} ${uGender===Gender.Female? "יכולה":"יכול"} להוסיף פרטים נוספים אם ${uPoS.sbj3rdPronoun} לא מרוצה מהתצפית שהוצגה ${uPoS.objPronoun}`})
                }

                return {
                    response_format: zodResponseFormat( z.object({
                        request_for_more_info: z.union([z.string(), z.null()]).describe("בקשה למידע נוסף להשלמת ניסוח התצפית"), 
                        observation: z.union([z.string(), z.null()]).describe("התצפית")
                    }), "observation"),                 
                    max_tokens: 600,
                    temperature: 0.7
                };

            case UserMessagePhase.FeelingsProbe:
                if(phaseCount === 0)
                    {
                        this.history.push(
                            { role: "system", content: `בהתבסס על התיאור של המשתמש${uPoS.Taf} ${uName}, מצא עד שלושה רגשות דומיננטיים המובעים בטקסט ותאר בקצרה את הלך הרוח מההבט הרגשי`})
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

    addUserInputToHistory = (userText: string)=>{
        this.history.push({role: "user", content: userText})
    }

    private updatePhase = (nextPhase: UserMessagePhase, phaseCount: number) => {
        this.storage?.setPhase(nextPhase);
        this.storage?.setPhaseCount(phaseCount);
    }

    private generateInitialFollowUpText = (phase: UserMessagePhase): string => {
        const {currentUser, userInRelationship} = (this.storage as ExtendedStorage)?.getState();
        let uPoS = completeUserPartOfSpeech(currentUser as User);
        let u2PoS = completeUserPartOfSpeech(userInRelationship as User);
    
        switch (phase) {
    
            case UserMessagePhase.PersonInConflictRelationship:      
                return ``;
            case UserMessagePhase.ObservationAnalysis:
                return `תודה! תאר${uPoS.Yod} את הסיטואציה עליה ${uPoS.sbj2ndPronoun} מדבר${uPoS.Taf}, מה קרה בעצם ? אני סקרן אז כמה שיותר פרטים בבקשה !`;
            case UserMessagePhase.PersonInConflictName:
                return `מה שמ${u2PoS.VavOrHei} ?`;
            case UserMessagePhase.PersonInConflictNickname:
                return `מהו כינוי החיבה של${u2PoS.VavOrHei} ?`;
            case UserMessagePhase.PersonInConflictAge:
                return `בת כמה ${u2PoS.sbj3rdPronoun} ?`;
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
        let assistant_msg = ""
        let content_type = MessageContentType.TextPlain

        if (bot_msg?.parsed) {

            let parsed_msg = Object(bot_msg.parsed)

            switch (phase) {

                case UserMessagePhase.PersonInConflictRelationship:

                    if(!parsed_msg.person_in_conflict_info)
                    {
                        this.updatePhase(phase, phaseCount+1)
                        content =  `(' לא הבנתי, למי בדיוק ${uPoS.sbj2ndPronoun} מתייחס${uPoS.Taf} (בת זוג, אמא, וכד`
                    } 
                    else {
                        let uir_data = userInRelationship.data as UserInRelationshipData
                        uir_data.relationship = parsed_msg.person_in_conflict_info.relationship;
                        let gender = parsed_msg.person_in_conflict_info.gender; 
                        uir_data.gender = 
                            gender === "זכר" ? Gender.Male : 
                            gender === "נקבה" ? Gender.Female : 
                            Gender.Other;
                        userInRelationship.data = uir_data;

                        info_required = false;
                        this.updatePhase(UserMessagePhase.PersonInConflictName, 0);
                        content = this.generateInitialFollowUpText(UserMessagePhase.PersonInConflictName);
                    }
                    assistant_msg = content
                    break;

                case UserMessagePhase.PersonInConflictName:
                        if(! parsed_msg.name) {
                            content = `לא הבנתי :-( ${uGender === Gender.Female ? "רשמי":"רשום"} את ${u2Gender === Gender.Female ? "שמה":"שמו"}`  
                        } else {
                            userInRelationship.firstName = parsed_msg.name;

                            info_required = false
                            if(["בת משפחה", "בן משפחה",
                                "בת", "בן",
                                "נכדה", "נכד",
                                "בת דוד", "בן דוד",
                                "דודה", "דוד",
                                "אחות", "אח",
                                "אחיינית", "אחיין", ].includes(
                                userInRelationship.data?.relationship as string))
                            {
                                this.updatePhase(UserMessagePhase.PersonInConflictAge, 0)
                                content = this.generateInitialFollowUpText(UserMessagePhase.PersonInConflictAge);
                            }
                            else if(["אישה", "בעל", "חבר", "חברה"].includes(
                                userInRelationship.data?.relationship as string))
                            {
                                this.updatePhase(UserMessagePhase.PersonInConflictNickname, 0)
                                content = this.generateInitialFollowUpText(UserMessagePhase.PersonInConflictNickname);
                            }
                            else{
    
                                this.updatePhase(UserMessagePhase.ObservationAnalysis, 0)
                                content = this.generateInitialFollowUpText(UserMessagePhase.ObservationAnalysis);
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
                        this.updatePhase(UserMessagePhase.ObservationAnalysis, 0)
                        content = this.generateInitialFollowUpText(UserMessagePhase.ObservationAnalysis);
                    }
                    assistant_msg = content
                    break;

                case UserMessagePhase.PersonInConflictAge:
                    if(!parsed_msg.age) {
                        content = `לא הבנתי אותך :-( מהו ${u2Gender === Gender.Female ? "גילה":"גילו"} ?`

                    } else {
                        (userInRelationship.data as UserInRelationshipData).age = parsed_msg.age;
                        info_required = false
                        this.updatePhase(UserMessagePhase.ObservationAnalysis, 0)
                        content = this.generateInitialFollowUpText(UserMessagePhase.ObservationAnalysis);
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
                        // this is a temporary phase because the user can decide he is not satisfied 
                        // with the given observation
                        this.updatePhase(UserMessagePhase.FeelingsProbe, 0)
                        content = {observation: parsed_msg.observation, id: "observation", active: true, isCorrect: null}
                        assistant_msg = parsed_msg.observation
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
        this.history.push({ role: 'assistant', content: assistant_msg } );

        if (info_required === true ){
            this.updatePhase(phase, phaseCount+1)
        }

        return { content: content, content_type: content_type, more_info_required: info_required };
    }

}