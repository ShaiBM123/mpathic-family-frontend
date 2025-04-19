import { UserMessagePhase } from '../open_ai/OpenAITypes';

export type UserFeeling = {
    emotion_name: string;
    emotion_intensity: "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10";
}

export type UserChatSessionData = {
    user_phase: UserMessagePhase,
    phase_count: number,
    // session meta data is all data set explicitly by the user using the chat interface 
    session_meta_data: {
        topic?: string,
        sub_topic?: string,
        corrected_feelings?: UserFeeling[],
    },
    person_in_conflict: {
        name?: {
            first_name: string,
            last_name: string
        },
        relationship?: {
            relationship_to_user: string,
            gender: 'female' | 'male'
        },
        age?: number
    },
    description_analysis: {
        description_is_complete?: boolean,
        more_details_request?: string,
        feelings?: UserFeeling[],
        observation0?: string,
        reflection_2nd_person_by_age_group?: string,
    }
};