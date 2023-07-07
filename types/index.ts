import { CompletionCreateParams } from "openai/resources/chat";

export type Message =
  CompletionCreateParams.CreateChatCompletionRequestNonStreaming.Message;
