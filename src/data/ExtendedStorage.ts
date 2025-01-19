import { 
    ChatState, 
    ConversationId, 
    User, 
    Presence, 
    UserStatus,
    Conversation,
    ConversationRole,
    Participant,
    TypingUsersList } from "@chatscope/use-chat";

import { openAIModel, openAIConversationId } from "./data";
import { UserInRelationshipData } from "../data/UserInRelationshipData";
import { BasicStorage, BasicStorageParams } from "@chatscope/use-chat";
import { UserMessagePhase } from '../open_ai/OpenAITypes';

export interface ExtendedStorageParams extends Required<BasicStorageParams> {

}

export type ExtendedChatState = {
    phase: UserMessagePhase, 
    phaseCount: number, 
    topic: string, 
    // setTopic: (topic: string) => void,
    subTopic: string,
    // setSubTopic: (subTopic: string) => void
    userInRelationship: User<UserInRelationshipData>
}

function createConversation(id: ConversationId, name: string): Conversation {
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
  extends BasicStorage<ConversationData>{

    private phase: UserMessagePhase;
    private phaseCount: number;
    // private _phaseGroupID?: string; 

    private topic: string;
    private subTopic: string;

    private userInRelationship: User;

     /**
   * Constructor
   * @param messageIdGenerator
   * @param groupIdGenerator
   */
    constructor({ groupIdGenerator, messageIdGenerator }: ExtendedStorageParams) {
        super({ groupIdGenerator, messageIdGenerator })
        this.phase = UserMessagePhase.PersonInConflictIdentity;
        this.phaseCount = 0;
        this.topic = '';
        this.subTopic = '';

        this.addUser(new User({
            id: openAIModel.name,
            presence: new Presence({ status: UserStatus.Available, description: "" }),
            firstName: "",
            lastName: "",
            username: openAIModel.name,
            email: "",
            avatar: openAIModel.avatar,
            bio: "מטפל וירטואלי בשיטת התקשורת המקרבת"
        }));
        this.addConversation(createConversation(openAIConversationId, openAIModel.name));

        this.userInRelationship = new User<UserInRelationshipData>({
            /* actual ID is a phone number,it will be detected once the main user will enter 
            the phone number of the user in relationship */
            id: "972-00-0000000", 
            presence: new Presence({ status: UserStatus.Unknown, description: "" }),
            firstName: "",
            lastName: "",
            username: "",
            email: "",
            avatar: undefined,
            bio: "",
            data: new UserInRelationshipData({})
        });
    }   
    
    /**
   * Sets topic
   * @param topic
   */
    setTopic(topic: string): void {
        this.topic = topic;
    }

    /**
   * Sets topic
   * @param subTopic
   */
    setSubTopic(subTopic: string): void {
        this.subTopic = subTopic;
    }

    /**
   * Sets current phase
   * @param phaseCount
   */
    setPhaseCount(phaseCount: number): void {
        this.phaseCount = phaseCount;
    }

    /**
   * Sets current phase
   * @param phase
   */
    setPhase(phase: UserMessagePhase): void {
        this.phase = phase;
    }

    /**
     * Sets current (logged in) user object
     * @param user
     */
    setUserInRelationship(user: User): void {
        this.userInRelationship = user;
    }

    removeMessageFromActiveConversation(messageId: string): void {
        let activeConversation = super.getState().activeConversation;

        if(activeConversation)
        {
            let filtered_groups = super.getState().currentMessages.map((g) => {
                return g.messages.filter((msg) => msg.id !== messageId);

            })

            this.removeMessagesFromConversation(activeConversation.id);

            for (const grp of filtered_groups){
                for (const msg of grp){
                    this.addMessage(msg, activeConversation.id);
                }
            }
        }
    }

    getState(): ChatState & ExtendedChatState {
        return {...super.getState(), 
            phase: this.phase, 
            phaseCount: this.phaseCount,
            topic: this.topic,
            subTopic: this.subTopic,
            userInRelationship: this.userInRelationship
        }
    }

    resetState(): void {
        super.resetState();
        this.phase = UserMessagePhase.PersonInConflictIdentity;
    }
}