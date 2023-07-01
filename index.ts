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
    const generator = sendMessage(text);

    if (!generator) {
      throw new Error("Failed to send message");
    }

    botStreamMessage(bot, message.chat.id, generator);
  } catch (error) {
    console.error(error);
    botSendMessage(
      bot,
      message.chat.id,
      "Sorry, I'm having trouble understanding you. Please try again."
    );
  }
}

async function botSendMessage(
  bot: TelegramBot,
  chatId: number,
  message: string
) {
  bot.sendMessage(chatId, message, {
    parse_mode: "Markdown",
  });
}

async function botStreamMessage(
  bot: TelegramBot,
  chatId: number,
  generator: AsyncGenerator<string, string | undefined, unknown>
) {
  let msgId;
  let lastValue;

  while (true) {
    const { value, done } = await generator.next();

    if (!value || value === lastValue) {
      break;
    }

    lastValue = value;

    if (!msgId) {
      const msg = await bot.sendMessage(chatId, value, {
        parse_mode: "Markdown",
      });
      msgId = msg.message_id;
      continue;
    }

    await bot.editMessageText(value, {
      chat_id: chatId,
      message_id: msgId,
      parse_mode: "Markdown",
    });

    if (done) {
      break;
    }
  }
}

async function main() {
  if (!TELEGRAM_TOKEN) {
    console.error("TELEGRAM_TOKEN is not defined");
    process.exit(1);
  }

  const bot = createBot(TELEGRAM_TOKEN);
  bot.on("message", (message) => handleBotMessage(bot, message));
}

main();
