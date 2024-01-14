import TelegramBot from "node-telegram-bot-api";
import { addChatMessage } from "./providers/postgres";

export async function botStreamMessage(
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
