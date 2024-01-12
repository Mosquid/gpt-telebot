import { ChatCompletionMessage } from "openai/resources/chat";

export type Message = ChatCompletionMessage;

export interface ChatMessage {
  content: string;
  role: Message["role"];
  chatId: number;
}
