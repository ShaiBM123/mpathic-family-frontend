import otherAvatar from "../assets/User1.svg";
import femaleAvatar from "../assets/User3.svg";
import maleAvatar from "../assets/User7.svg";
// import openAIAvatar from "../assets/openAI.svg";
import mpathicAvatar from "../assets/mpathic-face.svg";

import { nanoid } from "nanoid";

export enum Gender {
  Male = "זכר",
  Female = "נקבה"
};

export enum RelationshipCategory {
  Family = "משפחה",
  Family0 = "אחים או ילדים",
  FamilyD2 = "משפחה מדרגה 2",
  Friends = "חברים",
  Acquaintances = "מכרים",
  Work = "עבודה",
  School = "לימודים",
  Other = "אחר"
};

export const avatars = {
  [Gender.Male]: maleAvatar,
  [Gender.Female]: femaleAvatar
}


export const openAIModel = {
  name: "OpenAI",
  avatar: mpathicAvatar,
};

export const openAIConversationId = nanoid();

// export const users = [openAIModel];
