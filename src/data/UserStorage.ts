
import { ChatState, ConversationId, ChatMessage, MessageContentType } from "@chatscope/use-chat";
import { BasicStorage, BasicStorageParams } from "@chatscope/use-chat";
import { UserMessagePhase, OpenAIBotMessage } from '../OpenAIInterfaces';
import {openAIModel} from "../data/data";

export interface AppStorageParams extends Required<BasicStorageParams> {

}
export type UserChatState = ChatState & {phase: UserMessagePhase, phaseTransition: boolean}

export class UserStorage<ConversationData = any>
  extends BasicStorage<ConversationData>{

    private phase: UserMessagePhase;
    private phaseTransition: boolean;
    private _phaseGroupID?: string; 
     /**
   * Constructor
   * @param messageIdGenerator
   * @param groupIdGenerator
   */
    constructor({ groupIdGenerator, messageIdGenerator }: AppStorageParams) {
        super({ groupIdGenerator, messageIdGenerator })
        this.phase = UserMessagePhase.GeneralDescriptionAnalysis;
        this.phaseTransition = true;
    }   
    
      /**
   * Sets current (logged in) user object
   * @param phase
   */
    setPhase(phase: UserMessagePhase): void {
        this.phase = phase;
    }
    // CONTINUE HERE - DETERMINE WHEN phaseTransition IS FALSE ....
    addMessage(
        message: ChatMessage<MessageContentType>,
        conversationId: ConversationId,
        generateId = false): ChatMessage<MessageContentType> {

        let resultMsg = super.addMessage(message, conversationId, generateId)

        const { currentMessages } = super.getState();
        const lastGroup = currentMessages[currentMessages.length - 1];
        if(lastGroup.senderId ===  openAIModel.name && lastGroup.id !== this._phaseGroupID)
        {
            // this.phaseTransition = false;
            let bot_msg = message as OpenAIBotMessage;
            if(bot_msg.more_info_required !== undefined)
            {
                this._phaseGroupID = lastGroup.id;
                if(bot_msg.more_info_required === false)
                {
                    this.setPhase(this.phase + 1);
                    this.phaseTransition = true;
                }
                else if(bot_msg.more_info_required === true)
                {
                    this.phaseTransition = false;
                }
            }
        }

        return resultMsg;
    }

    getState(): UserChatState {
        return {...super.getState(), phase: this.phase, phaseTransition: this.phaseTransition}
    }

    resetState(): void {
        super.resetState();
        this.phase = UserMessagePhase.GeneralDescriptionAnalysis;
    }
}