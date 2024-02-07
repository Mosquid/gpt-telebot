import OpenAI from "openai";
import { notionCreatePage } from "./notion";
import TelegramBot from "node-telegram-bot-api";
import { scheduleReminder } from "./scheduler";

const API_KEY = process.env.OPENAI_API_KEY;
const openai = new OpenAI({
  apiKey: API_KEY,
});

async function isRunCompleted(threadId: string, runId: string) {
  try {
    const run = await openai.beta.threads.runs.retrieve(threadId, runId);
    const endStatuses = ["completed", "failed", "stopped", "requires_action"];

    if (endStatuses.includes(run.status)) {
      return run.required_action;
    }

    console.log(run.status, "Thread status");

    await new Promise((resolve) => setTimeout(resolve, 500));

    return isRunCompleted(threadId, runId);
  } catch (error) {
    console.error(error, "Failed to check thread status");
  }
}

async function save_entry(entry: string) {
  try {
    const data = JSON.parse(entry);
    await notionCreatePage(data);

    return data.summary;
  } catch (error) {
    console.error("Failed to save entry", error);
    return entry;
  }
}

function schedule_reminder(paramString: string, chat: TelegramBot.Chat) {
  try {
    const params = JSON.parse(paramString) as {
      diff_in_minutes: string;
      text: string;
    };

    const { diff_in_minutes, text } = params;
    const hoursDiff = Number(diff_in_minutes) / 60;
    const diffStr =
      hoursDiff > 1 ? `${hoursDiff} hours` : `${diff_in_minutes} minutes`;
    scheduleReminder(params, chat);

    return `Reminder scheduled in ${diffStr} with the text: ${text}`;
  } catch (error) {
    console.error("Failed to schedule reminder", error);
    return "Failed to schedule reminder";
  }
}

const functions = {
  save_entry,
  schedule_reminder,
};

export async function askAgent(content: string, chat: TelegramBot.Chat) {
  try {
    const thread = await openai.beta.threads.create({
      messages: [
        {
          role: "user",
          content: `${content}; \r current_time: {$(new Date().toISOString())}`,
        },
      ],
    });

    const run = await openai.beta.threads.runs.create(thread.id, {
      assistant_id: process.env.OPENAI_ASSISTANT_ID || "",
      model: "gpt-4-1106-preview",
    });

    const action = await isRunCompleted(thread.id, run.id);
    const [fnCall] = action?.submit_tool_outputs.tool_calls || [];

    if (!fnCall) {
      const messages = await openai.beta.threads.messages.list(thread.id);
      const [msg] = messages.data;

      return msg.content[0].type === "text" ? msg.content[0].text.value : "";
    }

    const fnName = fnCall.function.name;
    const callAtgs = fnCall?.function.arguments;

    if (fnName in functions) {
      const fn = functions[fnName as keyof typeof functions];
      if (typeof fn === "function") {
        return fn(callAtgs, chat);
      }
    }
    return "Sorry, I did not understand that.";
  } catch (error) {
    console.error(error, "Failed to ask agent");
  }
}
