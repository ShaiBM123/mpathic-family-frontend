import {
    ChatState,
    ConversationId,
    User,
    Presence,
    UserStatus,
    Conversation,
    ConversationRole,
    Participant,
    TypingUsersList,
    MessageGroup
} from "@chatscope/use-chat";

import { AIModel, AIConversationId } from "./data";
// import { UserInRelationshipData } from "../data/UserInRelationshipData";
import { BasicStorage, BasicStorageParams } from "@chatscope/use-chat";
import { UserPhase } from '../LLM/LLMTypes';
import { UserChatSessionData, UserFeeling } from "./ChatSessionData";

export interface ExtendedStorageParams extends Required<BasicStorageParams> {

}

export type ExtendedChatState = {
    currentUserSessionData: UserChatSessionData,
    // phase: UserMessagePhase,
    moreUserInputRequired: boolean,
    followUpChatMessagesRequired: boolean,
    // topic: string,
    // subTopic: string,
    // userInRelationship: User<UserInRelationshipData>,
    // openAIHistory: Array<{ role: string, content: string }>
}

export function createConversation(id: ConversationId, name: string): Conversation {
    return new Conversation({
        id,
        participants: [
            new Participant({
                id: name,
                role: new ConversationRole([])
            })
        ],
        unreadCounter: 0,
        typingUsers: new TypingUsersList({ items: [] }),
        draft: ""
    });
}

export class ExtendedStorage<ConversationData = any>
    extends BasicStorage<ConversationData> {

    private currentUserSessionData: UserChatSessionData;
    // private phase: UserMessagePhase;
    // private phaseCount: number;
    private moreUserInputRequired: boolean;
    private followUpChatMessagesRequired: boolean;
    // private _phaseGroupID?: string; 

    // private topic: string;
    // private subTopic: string;

    // private userInRelationship: User;
    // readonly openAIHistory: Array<{ role: "user" | "assistant" | "system", content: string }>

    /**
  * Constructor
  * @param messageIdGenerator
  * @param groupIdGenerator
  */
    constructor({ groupIdGenerator, messageIdGenerator }: ExtendedStorageParams) {
        super({ groupIdGenerator, messageIdGenerator })

        this.currentUserSessionData = {
            user_phase: UserPhase.Start,
            session_meta_data: {},
            person_in_conflict: { gender: 'unknown' },
            description_analysis: {},
            feelings_analysis: {}
        };

        this.moreUserInputRequired = true;
        this.followUpChatMessagesRequired = false;

        this.addUser(new User({
            id: AIModel.name,
            presence: new Presence({ status: UserStatus.Available, description: "" }),
            firstName: "",
            lastName: "",
            username: AIModel.name,
            email: "",
            avatar: AIModel.avatar,
            bio: "מטפל וירטואלי בשיטת התקשורת המקרבת"
        }));
        this.addConversation(createConversation(AIConversationId, AIModel.name));
    }

    /**
* Sets current user session data
* @param userSessionData
*/
    setCurrentUserSessionData(data: UserChatSessionData): void {
        this.currentUserSessionData = data;
    }

    resetCurrentUserSessionData(): void {
        this.currentUserSessionData = {
            user_phase: UserPhase.Start,
            session_meta_data: {},
            person_in_conflict: { gender: 'unknown' },
            description_analysis: {},
            feelings_analysis: {}
        };
    }
    /**
   * Sets topic
   * @param topic
   */
    setTopic(topic: string): void {
        this.currentUserSessionData.session_meta_data.topic = topic;
        // this.topic = topic;
    }

    /**
   * Sets sub topic
   * @param subTopic
   */
    setSubTopic(subTopic: string): void {
        this.currentUserSessionData.session_meta_data.sub_topic = subTopic;
        // this.subTopic = subTopic;
    }

    /**
* Sets user corrected feelings
* @param feelings
*/
    setCorrectedFeelings(feelings: UserFeeling[]): void {
        this.currentUserSessionData.session_meta_data.corrected_feelings = feelings;
    }

    /**
   * Sets current phase
   * @param phase
   */
    setPhase(phase: UserPhase): void {
        this.currentUserSessionData.user_phase = phase;
        // this.phase = phase;
    }


    /**
   * Sets current moreUserInputRequired
   * @param moreInputRequired
   */
    setMoreUserInputRequired(moreInputRequired: boolean): void {
        this.moreUserInputRequired = moreInputRequired;
    }


    /**
    * @param followUpChatMessagesRequired
    */
    setFollowUpChatMessagesRequired(followUpChatMessagesRequired: boolean): void {
        this.followUpChatMessagesRequired = followUpChatMessagesRequired;
    }

    /**

* @param role
* @param txt
*/

    removeMessageFromActiveConversation(messageId: string): void {
        let activeConversation = super.getState().activeConversation;

        if (activeConversation) {
            let filtered_groups = super.getState().currentMessages.map((g) => {
                return g.messages.filter((msg) => msg.id !== messageId);

            })

            this.removeMessagesFromConversation(activeConversation.id);

            for (const grp of filtered_groups) {
                for (const msg of grp) {
                    this.addMessage(msg, activeConversation.id);
                }
            }
        }
    }

    setMessagesInActiveConversation(messages: Array<MessageGroup>): void {
        let activeConversation = super.getState().activeConversation;
        if (activeConversation) {
            this.removeMessagesFromConversation(activeConversation.id);
            for (const grp of messages) {
                for (const msg of grp.messages) {
                    this.addMessage(msg, activeConversation.id);
                }
            }
        }
    }

    getState(): ChatState & ExtendedChatState {
        return {
            ...super.getState(),
            currentUserSessionData: this.currentUserSessionData,
            moreUserInputRequired: this.moreUserInputRequired,
            followUpChatMessagesRequired: this.followUpChatMessagesRequired,
        }
    }

    resetState(): void {
        super.resetState();
        this.resetCurrentUserSessionData();
        this.moreUserInputRequired = false;
        this.followUpChatMessagesRequired = false;
    }
}