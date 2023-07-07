require("dotenv").config();

import TelegramBot, { CallbackQuery } from "node-telegram-bot-api";
import { createBot, botSendMessage } from "./providers/telegram";
import { isWhitelisted } from "./providers/whitelist";
import { sendMessage } from "./providers/openai";
import {
  addChatMessage,
  deleteChatMessages,
  queryChatMessages,
} from "./providers/postgres";
import { Message } from "./types";

const TELEGRAM_TOKEN = process.env.TELEGRAM_API_KEY;

async function handleBotMessage(
  bot: TelegramBot,
  message: TelegramBot.Message
) {
  const { from, text, chat } = message;

  if (!from || !isWhitelisted(from.username) || !text) {
    return;
  }

  let history = await queryChatMessages(message.chat.id);
  history = history || [];
  console.log({ history });
  history.push({
    content: text,
    role: "user",
  });

  try {
    const generator = sendMessage(history as Array<Message>);

    if (!generator) {
      throw new Error("Failed to send message");
    }

    botStreamMessage(bot, message.chat.id, generator);
    await addChatMessage({
      chatId: chat.id,
      content: text,
      role: "user",
    });
  } catch (error) {
    console.error(error);
    botSendMessage(
      bot,
      chat.id,
      "Sorry, I'm having trouble understanding you. Please try again."
    );
  }
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
      ...(done && {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "New Chat",
                callback_data: "NEW",
              },
            ],
          ],
        },
      }),
    });

    if (done) {
      await addChatMessage({
        chatId,
        content: value,
        role: "assistant",
      });
      break;
    }
  }
}

async function handleBotCallbackQuery(bot: TelegramBot, query: CallbackQuery) {
  const { data, message } = query;

  if (!data || !message) {
    return;
  }
  try {
    if (data === "NEW") {
      await deleteChatMessages(message.chat.id);
      botSendMessage(bot, message.chat.id, "How can I help?");
    }
  } catch (error) {
    botSendMessage(
      bot,
      query.message!.chat.id,
      "Failed to start a new chat. Please try again."
    );
  }
}

async function main() {
  if (!TELEGRAM_TOKEN) {
    console.error("TELEGRAM_TOKEN is not defined");
    process.exit(1);
  }

  const bot = createBot(TELEGRAM_TOKEN);

  bot.on("message", (message) => handleBotMessage(bot, message));
  bot.on("callback_query", (data) => handleBotCallbackQuery(bot, data));
}

main();
