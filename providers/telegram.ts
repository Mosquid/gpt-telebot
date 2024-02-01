import TelegramBot from "node-telegram-bot-api";

export const TELEGRAM_TOKEN = process.env.TELEGRAM_API_KEY;

function createBot(token?: string) {
  if (!token) {
    console.error("No Telegram token provided");
    process.exit(1);
  }

  const bot = new TelegramBot(token || "", { polling: true });

  bot.on("error", (error) => {
    console.error("Telegram error", error);
  });

  return bot;
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

export const bot = createBot(TELEGRAM_TOKEN);
