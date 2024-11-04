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
  initial_message:
    "שלום, אני מטפל וירטואלי ואני יכול לסייע לך בפתרון בעיות אישיות ולייעץ לך כיצד ליישב מצבים לא פשוטים. נתחיל עם בחירת הנושא הרלוונטי לך",
};

export const users = [emilyModel, joeModel, openAIModel];
