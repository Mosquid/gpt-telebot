import { CompletionCreateParams } from "openai/resources/chat";

export type Message =
  CompletionCreateParams.CreateChatCompletionRequestNonStreaming.Message;

export interface ChatMessage {
  content: string;
  role: Message["role"];
  chatId: number;
}
