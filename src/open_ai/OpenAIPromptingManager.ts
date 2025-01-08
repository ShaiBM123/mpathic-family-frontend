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
// import { MessageContent } from "@chatscope/use-chat/dist/interfaces";
import {ChatModel} from "openai/resources";
import { Gender } from '../data/data';

export type SyestemPromptData = { 
    response_format: AutoParseableResponseFormat<zodInfer<ZodType>>,
    max_tokens: number,
    temperature: number 
} | undefined

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
        const {phase, phaseTransition, topic, subTopic, currentUser, userInRelationship} = this.storage?.getState();
        let u_name = currentUser?.firstName;
        let u_gender = currentUser?.data.gender;
        
        switch (phase) {
            case UserMessagePhase.PersonInConflictRelationship:
                if(phaseTransition)
                {
                    this.history.push(
                        { role: "system", content: `במשפט הבא המשתמש${u_gender===Gender.Female? "ת":""} ${u_name} מתאר${u_gender===Gender.Female? "ת":""} אל מי ${u_gender===Gender.Female? "היא":"הוא"} מתייחס${u_gender===Gender.Female? "ת":""}, עליך לזהות את הקרבה של המשתמש${u_gender===Gender.Female? "ת":""} אל אותו אדם ואת מינו (זכר או נקבה)`});
                }

                return {
                    
                    response_format: zodResponseFormat( z.object({
                        person_in_conflict_info: z.union([
                            z.object({
                                relationship: z.union([
                                    z.enum([
                                        "בן או בת משפחה", 
                                        "אישה", "בעל", 
                                        "חבר", "חברה", 
                                        "ידיד", "ידידה",
                                        "בוס", "עמית לעבודה",   
                                        "אחר"]), z.null()]), 
                                gender: z.union([z.enum(["זכר", "נקבה"]), z.null()])
                            }), z.null()]),
                    }), "relationship_to_the_person_in_conflict"),                 
                    max_tokens: 200,
                    temperature: 0.7
                };
     
            case UserMessagePhase.PersonInConflictName:
                if(phaseTransition)
                {
                    this.history.push(
                        { role: "system", content: 'עליך לזהות בטקסט הבא את שמו הפרטי של האדם אליו המשתמש מתייחס'})
                }

                return {                    
                    response_format: zodResponseFormat( z.object({
                        name:  z.union([z.string(), z.null()]).describe("שם פרטי"),
                    }), "name_of_the_person_in_conflict"),                 
                    max_tokens: 200,
                    temperature: 0.7
                };

            case UserMessagePhase.PersonInConflictNickname:
                if(phaseTransition)
                {
                    this.history.push(
                        { role: "system", content: `עליך לזהות בטקסט הבא את כינוי החיבה של ${userInRelationship.firstName}`})
                }

                return {
                    response_format: zodResponseFormat( z.object({ 
                        nickname:  z.union([z.string(), z.null()]).describe("כינוי חיבה"),
                    }), "nickname_of_the_person_in_conflict"),                 
                    max_tokens: 200,
                    temperature: 0.7
                };
          
            case UserMessagePhase.PersonInConflictAge:
                if(phaseTransition)
                {
                    this.history.push(
                        { role: "system", content: 'במשפט הבא עליך לזהות את גילו של אותו אדם'})
                }

                return {
                    response_format: zodResponseFormat( z.object({
                        age: z.union([z.number(), z.null()]),
                    }), "age_of_the_person_in_conflict"),                 
                    max_tokens: 200,
                    temperature: 0.7
                };
            case UserMessagePhase.DescriptionAnalysis:
                if(phaseTransition)
                {
                    this.history.push(
                        { role: "system", content: `בהנתן תיאור של המשתמש לגבי סיטואציה בנושא  ${topic} בכל מה שקשור ב ${subTopic} מול ${userInRelationship.firstName} ה${userInRelationship.data?.relationship} שלו נסח תצפית לפי הגישה של תקשורת מקרבת`},
                        { role: "system", content: 'תצפית מוגדרת כהתמקדות במה שאנחנו רואים שומעים או מבחינים בו באופן אובייקטיבי מבלי להוסיף רגש, שיפוט, פרשנות או הערכה'},
                        { role: "system", content: `אם התיאור של המשתמש מלא נסח תצפית אחרת בקש ממנו פרטים נוספים`},
                        { role: "system", content: `המשתמש יכול להוסיף פרטים נוספים אם הוא לא מרוצה מהתצפית שהוצגה לו`})
                }

                return {
                    response_format: zodResponseFormat( z.object({
                        request_for_more_info: z.union([z.string(), z.null()]).describe("בקשה למידע נוסף להשלמת ניסוח התצפית"), 
                        observation: z.union([z.string(), z.null()]).describe("התצפית")
                    }), "observation"),                 
                    max_tokens: 600,
                    temperature: 0.7
                };
            // case UserMessagePhase.RecurrentDescriptionAnalysis:
            //     if(phaseTransition)
            //     {
            //         this.history.push( 
            //             { role: "system", content: `המשתמש ${currentUser?.firstName} אינו מרוצה מהתצפית שיצרת בשלב הקודם , בהנתן המידע הנוסף שהוא נותן בפסקה הבאה צור מחדש תצפית על פי מודל תקשורת מקרבת`})
            //     }

            //     return {
            //         response_format: zodResponseFormat( z.object({
            //             observation: z.union([z.string(), z.null()]).describe("התצפית")
            //         }), "recurrent observation"),                 
            //         max_tokens: 500,
            //         temperature: 0.7
            //     };
            case UserMessagePhase.FeelingsProbe:

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

    }

    addUserInputToHistory = (user_text: string)=>{
        this.history.push({role: "user", content: user_text})
    }

    private updatePhase = (next_phase: UserMessagePhase, transition: boolean) => {
        this.storage?.setPhase(next_phase);
        this.storage?.setPhaseTransition(transition);
    }

    private phaseToInitialText = {
        [UserMessagePhase.PersonInConflictRelationship] : "(' למי אתה מתייחס (בת זוג, אמא, וכד",
        [UserMessagePhase.DescriptionAnalysis]: "תודה! תאר את הסיטואציה עליה אתה מדבר, מה קרה בעצם ? אני סקרן אז כמה שיותר פרטים בבקשה !",
        [UserMessagePhase.PersonInConflictName]: "מה שמה ?",
        [UserMessagePhase.PersonInConflictNickname]: "מהו כינוי החיבה שלה ?",
        [UserMessagePhase.PersonInConflictAge]: "בת כמה היא ?",
        [UserMessagePhase.FeelingsProbe]: "",
        [UserMessagePhase.FeelingsAnalysis]: "",
        [UserMessagePhase.NeedsProbe]: "",
        [UserMessagePhase.TBD]: ""
    }

    buildBotResponse = (
        bot_msg: {parsed: Object | null, refusal: string | null}):

        { content: Object, content_type: MessageContentType, more_info_required: boolean }  => 
    {
        const {phase, userInRelationship} = (this.storage as ExtendedStorage)?.getState();

        let info_required = true
        let content: any = ""
        let content_type = MessageContentType.TextPlain

        if (bot_msg?.parsed) {
            let parsed_msg = Object(bot_msg.parsed)

            switch (phase) {

                case UserMessagePhase.PersonInConflictRelationship:

                    if(!parsed_msg.person_in_conflict_info)
                    {
                        this.updatePhase(phase, false)
                        content =  "(' לא הבנתי, למי בדיוק אתה מתייחס (בת זוג, אמא, וכד"
                    } 
                    else {
                        let uir_data = userInRelationship.data as UserInRelationshipData
                        uir_data.relationship = parsed_msg.person_in_conflict_info.relationship;
                        uir_data.gender = parsed_msg.person_in_conflict_info.gender;
                        userInRelationship.data = uir_data;

                        info_required = false
                        this.updatePhase(UserMessagePhase.PersonInConflictName, true)
                        content = this.phaseToInitialText[UserMessagePhase.PersonInConflictName]
                    }

                    break;

                case UserMessagePhase.PersonInConflictName:
                        if(! parsed_msg.name)
                        {
                            content = "לא הבנתי :-( רשום את שמה"  
    
                        } else {
                            userInRelationship.firstName = parsed_msg.name;

                            info_required = false
                            if(userInRelationship.data?.relationship === "בן או בת משפחה")
                                {
                                    this.updatePhase(UserMessagePhase.PersonInConflictAge, true)
                                    content = this.phaseToInitialText[UserMessagePhase.PersonInConflictAge]
                                }
                                else if(["אישה", "בעל", "חבר", "חברה"].includes(
                                    userInRelationship.data?.relationship as string))
                                {
                                    this.updatePhase(UserMessagePhase.PersonInConflictNickname, true)
                                    content = this.phaseToInitialText[UserMessagePhase.PersonInConflictNickname]
                                }
                                else{
        
                                    this.updatePhase(UserMessagePhase.DescriptionAnalysis, true)
                                    content = this.phaseToInitialText[UserMessagePhase.DescriptionAnalysis]
                                }
                        }
    
                        break;

                case UserMessagePhase.PersonInConflictNickname:
                    if(! parsed_msg.nickname)
                    {
                        content = "לא הבנתי אותך :-( רשום את כינוי החיבה שלה"  

                    } else {
                        (userInRelationship.data as UserInRelationshipData).nickName = parsed_msg.nickname;
                        info_required = false
                        this.updatePhase(UserMessagePhase.DescriptionAnalysis, true)
                        content = this.phaseToInitialText[UserMessagePhase.DescriptionAnalysis]
                    }

                    break;
                case UserMessagePhase.PersonInConflictAge:
                    if(!parsed_msg.age)
                    {
                        content = "לא הבנתי אותך :-( מהו גילה ?"

                    } else {
                        (userInRelationship.data as UserInRelationshipData).age = parsed_msg.age;
                        info_required = false
                        this.updatePhase(UserMessagePhase.DescriptionAnalysis, true)
                        content = this.phaseToInitialText[UserMessagePhase.DescriptionAnalysis]
                    }

                    break;

                case UserMessagePhase.DescriptionAnalysis:
                    if(!parsed_msg.observation){
                        content = parsed_msg.request_for_more_info
                    } 
                    else {
                        info_required = false
                        content_type = MessageContentType.Other
                        // this is a temporary phase because the user can decide he is satisfied 
                        // with the given observation
                        this.updatePhase(UserMessagePhase.FeelingsProbe, true)
                        content = {observation: parsed_msg.observation, id: "observation", active: true, isCorrect: null}
                    }
                    break;

                // case UserMessagePhase.RecurrentDescriptionAnalysis:

                //     info_required = false
                //     content_type = MessageContentType.Other
                //     // this is a temporary phase because the user can decide he is satisfied 
                //     // with the given observation
                //     this.updatePhase(UserMessagePhase.RecurrentDescriptionAnalysis, false)
                //     content = {observation: parsed_msg.observation, id: "observation", active: true, isCorrect: null}
                    
                //     break;

                case UserMessagePhase.FeelingsProbe:
    
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
        }

        this.storage?.setUserInRelationship(userInRelationship);
        this.updateState();
        this.history.push({ role: 'assistant', content: content });

        if (info_required === true ){
            this.updatePhase(phase, false)
        }

        return { content: content, content_type: content_type, more_info_required: info_required };
    }

}