import otherAvatar from "../assets/User1.svg";
import femaleAvatar from "../assets/User3.svg";
import maleAvatar from "../assets/User7.svg";
import openAIAvatar from "../assets/openAI.svg";

import { nanoid } from "nanoid";

export enum Gender {
  Male = "זכר",
  Female = "נקבה",
  Other = "אחר"
};

export const avatars = {
  [Gender.Male]: maleAvatar,
  [Gender.Female]: femaleAvatar,
  [Gender.Other]: otherAvatar
}


export const openAIModel = {
  name: "OpenAI",
  avatar: openAIAvatar,
};

export const openAIConversationId = nanoid();

// export const users = [openAIModel];
