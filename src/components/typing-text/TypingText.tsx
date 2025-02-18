import React from 'react';
// import Typed from 'typed.js';
import { ReactTyped } from "react-typed";
// import { TypedOptions } from 'typed.js';
import {
  ChatMessage,
  MessageContentType,
} from "@chatscope/use-chat";

import {
  useChat, MessageStatus
} from "@chatscope/use-chat";

export type TypingTextProps = {
  chatMsg: ChatMessage<MessageContentType>;
  chatMsgContentToStrings: (c: Object) => Array<string>
  onStringTyped?: () => void
  onComplete?: () => void
}

export const TypingText = ({ chatMsg, chatMsgContentToStrings, onStringTyped, onComplete }: TypingTextProps) => {

  const { updateMessage } = useChat();
  const doOnComplete = onComplete ? onComplete :
    () => {
      chatMsg.status = MessageStatus.Sent;
      updateMessage(chatMsg)
    };

  return (
    <div className='typing-text-wrapper'>
      <ReactTyped
        typeSpeed={20}
        showCursor={true}
        onStringTyped={onStringTyped}
        onComplete={doOnComplete}
        strings={chatMsgContentToStrings(chatMsg.content)}
      />
    </div>
  );
}
