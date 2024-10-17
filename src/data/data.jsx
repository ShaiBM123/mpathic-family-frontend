import emilyAvatar from "../assets/User3.svg";
import joeAvatar from "../assets/User7.svg";
import openAIAvatar from "../assets/openAI.svg";

export const emilyModel = {
  name: "Emily",
  avatar: emilyAvatar,
};

export const joeModel = {
  name: "Joe",
  avatar: joeAvatar,
};

export const openAIModel = {
  name: "OpenAI",
  avatar: openAIAvatar,
  initial_messages: [
    "Hello I'm chatbot therapist and I can help you solving personal issues and advising you how to reconcile the situation",
    "Tell me what bothers you today ?",
  ],
};

export const users = [emilyModel, joeModel, openAIModel];
