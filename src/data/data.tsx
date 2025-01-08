import femaleAvatar from "../assets/User3.svg";
import maleAvatar from "../assets/User7.svg";
import openAIAvatar from "../assets/openAI.svg";
import { nanoid } from "nanoid";

export enum Gender {
  Male = "זכר",
  Female = "נקבה",
  Other = "אחר"
};

export const userModel = {
  name: "Shai",
  avatar: maleAvatar,
  gender: Gender.Male
};

export const openAIModel = {
  name: "OpenAI",
  avatar: openAIAvatar,
};

export const openAIConversationId = nanoid();

export const users = [userModel, openAIModel];
