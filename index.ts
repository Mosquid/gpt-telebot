require("dotenv").config();

import TelegramBot from "node-telegram-bot-api";
import { createBot } from "./providers/telegram";
import { isWhitelisted } from "./providers/whitelist";
import { sendMessage } from "./providers/openai";

const TELEGRAM_TOKEN = process.env.TELEGRAM_API_KEY;

async function handleBotMessage(
  bot: TelegramBot,
  message: TelegramBot.Message
) {
  const { from, text } = message;

  if (!from || !isWhitelisted(from.username) || !text) {
    return;
  }

  try {
    const gptResponse = await sendMessage(text);

    if (!gptResponse || !gptResponse.content) {
      throw new Error("Failed to send message");
    }

    const { content } = gptResponse;

    botSendMessage(bot, message.chat.id, content);
  } catch (error) {
    console.error(error);
    botSendMessage(
      bot,
      message.chat.id,
      "Sorry, I'm having trouble understanding you. Please try again."
    );
  }
}

function botSendMessage(bot: TelegramBot, chatId: number, text: string) {
  bot.sendMessage(chatId, text, { parse_mode: "Markdown" });
}

function main() {
  if (!TELEGRAM_TOKEN) {
    console.error("TELEGRAM_TOKEN is not defined");
    process.exit(1);
  }

  const bot = createBot(TELEGRAM_TOKEN);
  bot.on("message", (message) => handleBotMessage(bot, message));
}

main();
