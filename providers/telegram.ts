import TelegramBot from "node-telegram-bot-api";

export function createBot(token: string) {
  return new TelegramBot(token, { polling: true });
}
