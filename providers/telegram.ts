import TelegramBot from "node-telegram-bot-api";

export function createBot(token: string) {
  return new TelegramBot(token, { polling: true });
}

export function botSendMessage(
  bot: TelegramBot,
  chatId: number,
  message: string
) {
  bot.sendMessage(chatId, message, {
    parse_mode: "Markdown",
  });
}
