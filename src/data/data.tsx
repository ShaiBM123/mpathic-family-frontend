// import otherAvatar from "../images/chat/User1.svg";
import femaleAvatar from "../images/chat/User3.svg";
import maleAvatar from "../images/chat/User7.svg";
// import openAIAvatar from "../images/chat/openAI.svg";
import mpathicAvatar from "../images/chat/mpathic-face.svg";

import { nanoid } from "nanoid";

export enum Gender {
  Male = "זכר",
  Female = "נקבה"
};

export enum RelationshipCategory {
  Family = "משפחה",
  SiblingsOrChildren = "אחים או ילדים",
  Parents = "אמא או אבא",
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


export const AIModel = {
  name: "OpenAI",
  avatar: mpathicAvatar,
};

export const AIConversationId = nanoid();

// export const users = [openAIModel];
