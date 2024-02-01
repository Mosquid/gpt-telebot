import schedule from "node-schedule";
import { bot, botSendMessage } from "./telegram";
import TelegramBot from "node-telegram-bot-api";
import moment from "moment";

export interface Reminder {
  diff_in_minutes: string;
  text: string;
}

export function scheduleReminder(
  { diff_in_minutes, text }: Reminder,
  chat: TelegramBot.Chat
) {
  try {
    const date = moment().add(Number(diff_in_minutes), "minutes").toDate();

    schedule.scheduleJob(date, () => {
      botSendMessage(bot, chat.id, text);
    });
  } catch (error) {
    console.error("Failed to schedule reminder", error);
  }
}
