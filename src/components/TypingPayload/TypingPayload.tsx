import React from "react";

// import { useEffect, useState } from "react";
import { ReactTyped } from "react-typed";
// import {Message, MessageProps} from "@chatscope/chat-ui-kit-react";
import "./TypingPayload.css";

const TypingTextPayload = (message: string) => {
  return (
    <div className="text-typing-message-container">
      <ReactTyped strings={[message]} typeSpeed={20} showCursor={false} />
    </div>
  );
};

export default TypingTextPayload;
