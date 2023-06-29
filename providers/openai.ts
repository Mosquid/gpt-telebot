import { ChatCompletionRequestMessage, Configuration, OpenAIApi } from "openai";

const API_KEY = process.env.OPENAI_API_KEY;

const configuration = new Configuration({
  apiKey: API_KEY,
});
const openai = new OpenAIApi(configuration);
const messages: Array<ChatCompletionRequestMessage> = [
  {
    role: "system",
    content: `Do not use phrases that start with "As and AI model...". If you can't tell, say that you can't. If you don't know say you don't know. If you don't understand, say you don't understand.`,
  },
];

export async function sendMessage(content: string) {
  messages.push({
    role: "user",
    content,
  });

  try {
    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages,
    });
    const { message } = response.data.choices[0];

    return message;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to send message");
  }
}
