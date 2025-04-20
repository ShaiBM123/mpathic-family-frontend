import { MessageContentType } from "@chatscope/use-chat/dist/enums";
import { MessageContent } from "@chatscope/use-chat/dist/interfaces"
import { ChatMessage } from "@chatscope/use-chat/dist";

export enum LLMContentType {
  JSON = 10
}

export enum UserPhase {
  Start = 0,
  FE_MainTopic = 1,
  FE_SubTopic = 2,
  BE_PersonInConflictRelation = 3,
  BE_PersonInConflictName = 4,
  BE_PersonInConflictAge = 5,
  BE_DescriptionAnalysis = 6,
  FE_FeelingsProbe = 7,
  BE_FeelingsAnalysis = 8,
  BE_NeedsProbe = 9,
  TBD = 999,
  Unknown = 1000
}

export interface UserMessageContent extends MessageContent<MessageContentType> {
  user_text: string;
  // phase: UserMessagePhase;
}

export interface LLMBotMessage extends ChatMessage<MessageContentType> {

  /**
   * The index of the choice in the list of choices.
   */
  index: number;

  // REMOVED - THESE VARS SHOULD NOT BE STORED IN EACH MSG REPLY (unnecessary replications)
  // refusal: boolean;
  // more_info_required: boolean;

};

export interface LLMMessageReceivedType {
  (created: Date, intervalId: number, conversationId: string, messages: Array<LLMBotMessage>, sender: unknown): void;
}

export interface LLMGeneratingMessageType {
  (conversationId: string, userId: string): void;
}

export type TextualChatMessage = ChatMessage<MessageContentType.TextPlain | MessageContentType.TextMarkdown | MessageContentType.TextHtml>

export type MsgContentData = { content: any, content_type?: MessageContentType }
