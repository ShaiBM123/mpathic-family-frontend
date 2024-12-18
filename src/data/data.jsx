import femaleAvatar from "../assets/User3.svg";
import maleAvatar from "../assets/User7.svg";
import openAIAvatar from "../assets/openAI.svg";
import { nanoid } from "nanoid";

export const userModel = {
  name: "Shai",
  avatar: maleAvatar,
};

export const openAIModel = {
  name: "OpenAI",
  avatar: openAIAvatar,
  initial_message:
    "היי :) בחר.י נושא עליו תרצה.י לדבר או נושא שמעסיק אותך עכשיו",
};

export const openAIConversationId = nanoid();

export const users = [userModel, openAIModel];
