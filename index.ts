require("dotenv").config();

import TelegramBot, { CallbackQuery } from "node-telegram-bot-api";
import { createBot, botSendMessage } from "./providers/telegram";
import { isWhitelisted } from "./providers/whitelist";
import { askAgent } from "./providers/openai";
import { addChatMessage, deleteChatMessages } from "./providers/postgres";
import { transcribeUrl } from "./providers/deepgram";
import { notionCreatePage } from "./providers/notion";

const TELEGRAM_TOKEN = process.env.TELEGRAM_API_KEY;

async function handleVoiceMessage(
  bot: TelegramBot,
  message: TelegramBot.Message
) {
  const { voice } = message;
  const file = await bot.getFile(voice!.file_id);
  const url = `https://api.telegram.org/file/bot${TELEGRAM_TOKEN}/${file.file_path}`;
  const { results } = await transcribeUrl(url);
  const { channels } = results;
  const [channel] = channels;
  const { alternatives } = channel;
  const [alternative] = alternatives;
  const { transcript } = alternative;

  return transcript;
}

async function handleBotMessage(
  bot: TelegramBot,
  message: TelegramBot.Message
) {
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

    const fnArgs = await askAgent(text);

    if (fnArgs) {
      await notionCreatePage(fnArgs);
      botSendMessage(bot, chat.id, fnArgs.summary);
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

  if (!data || !message || data !== "NEW") {
    return;
  }
  try {
    await deleteChatMessages(message.chat.id);
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
  if (!TELEGRAM_TOKEN) {
    console.error("TELEGRAM_TOKEN is not defined");
    process.exit(1);
  }

  await askAgent("test my telegram bot");

  const bot = createBot(TELEGRAM_TOKEN);

  bot.on("message", (message) => handleBotMessage(bot, message));
  bot.on("callback_query", (data) => handleBotCallbackQuery(bot, data));
}

main();
