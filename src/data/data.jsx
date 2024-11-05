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
    "שלום, אני מטפל וירטואלי ואני יכול לסייע לך בפתרון בעיות אישיות ולייעץ לך כיצד ליישב מצבים לא פשוטים. נתחיל עם בחירת הנושא הרלוונטי לך",
};

export const openAIConversationId = nanoid();

export const users = [userModel, openAIModel];
