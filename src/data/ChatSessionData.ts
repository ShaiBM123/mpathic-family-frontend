import { UserPhase } from '../LLM/LLMTypes';

export type UserFeeling = {
    emotion_name: string;
    emotion_intensity: "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10";
}

export type PersonInConflictData = {
    name?: {
        first_name: string
    },
    gender: 'female' | 'male' | 'unknown',
    relationship_to_user?: string,
    age?: number
};

export type UserChatSessionData = {
    user_phase: UserPhase,
    // session meta data is all data set explicitly by the user using the chat interface 
    session_meta_data: {
        topic?: string,
        sub_topic?: string,
        corrected_feelings?: UserFeeling[],
    },
    person_in_conflict: PersonInConflictData,

    description_analysis: {
        description_is_complete?: boolean,
        more_details_request?: string,
        refinement_count?: number,
        feelings?: UserFeeling[],
        observation0?: string,
        reflection?: string,
    },
    feelings_analysis: {
        description?: string
    }
};
