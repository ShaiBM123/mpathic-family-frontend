import { UserMessagePhase } from '../open_ai/OpenAITypes';
import { Gender } from "./data";

export type UserChatSessionData = {
    user_phase: UserMessagePhase,
    phase_count: number,
    session_meta_data: { topic?: string, sub_topic?: string },
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
        feelings?: {
            emotion_name: string;
            emotion_intensity: "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10";
        }[],
        observation0?: string,
        reflection_2nd_person_by_age_group?: string,
    }
};