import OpenAI from "openai";
import { Message } from "../types";

const API_KEY = process.env.OPENAI_API_KEY;
const CHUNK_SIZE = 20;

const openai = new OpenAI({
  apiKey: API_KEY,
});

export async function* sendMessage(history: Array<Message>) {
  const messages: Array<Message> = [
    {
      role: "system",
      content: `Strictly avoid phrases that start with "As and AI model". If you can't tell, say that you can't. If you don't know say you don't know. If you don't understand, say you don't understand.`,
    },
    ...history,
  ];

  const message = [];
  let yieldedTimes = 0;
  console.log(messages);
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages,
      stream: true,
    });

    for await (const part of response) {
      const [chioce] = part.choices;
      const { content } = chioce.delta || {};

      message.push(content);
      const yieldableChunks = Math.ceil(message.length / CHUNK_SIZE);

      if (content && (!yieldedTimes || yieldableChunks > yieldedTimes)) {
        yieldedTimes = yieldableChunks;

        yield message.join("");
        continue;
      }

      if (chioce.finish_reason === "stop") {
        return message.join("");
      }
    }
  } catch (error) {
    console.error(error);
    throw new Error("Failed to send message");
  }
}
