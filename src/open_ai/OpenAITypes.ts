import { MessageContentType } from "@chatscope/use-chat/dist/enums";
import { MessageContent } from "@chatscope/use-chat/dist/interfaces"
import { ChatMessage } from "@chatscope/use-chat/dist";

export enum OpenAIContentType {
  JSON = 10
}

export enum UserMessagePhase {
  Start = 0,
  FE_User1stTimeApproval = 1,
  FE_UserGender = 2,
  FE_UserName = 3,
  FE_UserAge = 4,
  FE_MainTopic = 5,
  FE_SubTopic = 6,
  BE_PersonInConflictRelation = 7,
  BE_PersonInConflictName = 8,
  BE_PersonInConflictNickname = 9,
  BE_PersonInConflictAge = 10,
  BE_ObservationAnalysis = 11,
  BE_FeelingsProbe = 12,
  BE_FeelingsAnalysis = 13,
  BE_NeedsProbe = 14,
  TBD = 999,
  Unknown = 1000
}

export interface UserMessageContent extends MessageContent<MessageContentType> {
  user_text: string;
  // phase: UserMessagePhase;
}

export interface OpenAIBotMessage extends ChatMessage<MessageContentType> {

  /**
   * The index of the choice in the list of choices.
   */
  index: number;

  // REMOVED - THESE VARS SHOULD NOT BE STORED IN EACH MSG REPLY (unnecessary replications)
  // refusal: boolean;
  // more_info_required: boolean;

};

export interface OpenAIMessageReceivedType {
  (created: Date, intervalId: number, conversationId: string, messages: Array<OpenAIBotMessage>, sender: unknown): void;
}

export interface OpenAIGeneratingMessageType {
  (conversationId: string, userId: string): void;
}

export type TextualChatMessage = ChatMessage<MessageContentType.TextPlain | MessageContentType.TextMarkdown | MessageContentType.TextHtml>

export type MsgContentData = { content: any, content_type?: MessageContentType }
