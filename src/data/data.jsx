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
    "שלום, אני מטפל וירטואלי ואני יכול לסייע לך בפתרון בעיות אישיות ולייעץ לך כיצד ליישב מצבים לא פשוטים. מה מפריע לך היום?",
  ],
};

export const users = [emilyModel, joeModel, openAIModel];
