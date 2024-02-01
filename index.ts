require("dotenv").config();

import TelegramBot, { CallbackQuery } from "node-telegram-bot-api";
import { botSendMessage, bot, TELEGRAM_TOKEN } from "./providers/telegram";
import { isWhitelisted } from "./providers/whitelist";
import { askAgent } from "./providers/openai";
import { transcribeUrl } from "./providers/deepgram";

async function handleVoiceMessage(
  bot: TelegramBot,
  message: TelegramBot.Message
) {
  const { voice } = message;
  const file = await bot.getFile(voice!.file_id);
  const url = `https://api.telegram.org/file/bot${TELEGRAM_TOKEN}/${file.file_path}`;
  const transcript = await transcribeUrl(url);

  return transcript;
}

async function handleBotMessage(
  bot: TelegramBot,
  message: TelegramBot.Message
) {
  console.log("[ooo[");
  let { text } = message;
  const { from, chat } = message;

  if (!from || !isWhitelisted(from.username) || !(text || message.voice)) {
    return;
  }

  if (message.voice) {
    text = await handleVoiceMessage(bot, message);
  }

  try {
    if (!text) return;

    const reply = await askAgent(text, chat);

    if (reply) {
      botSendMessage(bot, chat.id, reply);
    } else {
      botSendMessage(bot, chat.id, "Sorry, I did not understand that.");
    }
  } catch (error) {
    console.error(error);
    botSendMessage(
      bot,
      chat.id,
      "Sorry, I'm having trouble understanding you. Please try again."
    );
  }
}

async function handleBotCallbackQuery(bot: TelegramBot, query: CallbackQuery) {
  const { data, message } = query;

  if (!data || !message || data !== "NEW") {
    return;
  }
  try {
    botSendMessage(bot, message.chat.id, "How can I help?");
  } catch (error) {
    botSendMessage(
      bot,
      message.chat.id,
      "Failed to start a new chat. Please try again."
    );
  }
}

async function main() {
  bot.on("message", (message) => handleBotMessage(bot, message));
  bot.on("callback_query", (data) => handleBotCallbackQuery(bot, data));
}

main();
