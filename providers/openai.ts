import OpenAI from "openai";
import { Message } from "../types";
import callFunctionByName from "./functions";
import { notionCreatePage } from "./notion";

const API_KEY = process.env.OPENAI_API_KEY;
const CHUNK_SIZE = 20;

const openai = new OpenAI({
  apiKey: API_KEY,
});

export async function* sendMessage(history: Array<Message>) {
  const messages: Array<any> = [
    {
      role: "system",
      content: `Strictly avoid phrases that start with "As and AI model". If you can't tell, say that you can't. If you don't know say you don't know. If you don't understand, say you don't understand.`,
    },
    ...history,
  ];

  const message = [];
  let yieldedTimes = 0;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages,
      stream: true,
      functions: [
        {
          name: "turn_on_blue_light",
          parameters: {
            type: "object",
            properties: {
              time: {
                type: "string",
                description: "Get the current time.",
              },
            },
            required: [],
          },
        },
        {
          name: "turn_off_blue_light",
          parameters: {
            type: "object",
            properties: {
              time: {
                type: "string",
                description: "Get the current time.",
              },
            },
            required: [],
          },
        },
        {
          name: "turn_off_green_light",
          parameters: {
            type: "object",
            properties: {
              time: {
                type: "string",
                description: "Get the current time.",
              },
            },
            required: [],
          },
        },
        {
          name: "turn_on_green_light",
          parameters: {
            type: "object",
            properties: {
              time: {
                type: "string",
                description: "Get the current time.",
              },
            },
            required: [],
          },
        },
      ],
    });

    for await (const part of response) {
      const [chioce] = part.choices;
      const { content, function_call } = chioce.delta || {};

      if (function_call) {
        callFunctionByName(function_call);
        return "Sure! My pleasure.";
      }

      message.push(content);
      const yieldableChunks = Math.ceil(message.length / CHUNK_SIZE);

      if (content && (!yieldedTimes || yieldableChunks > yieldedTimes)) {
        yieldedTimes = yieldableChunks;

        yield message.join("");
        continue;
      }

      if (chioce.finish_reason === "stop") {
        return message.join("");
      }
    }
  } catch (error) {
    console.error(error);
    throw new Error("Failed to send message");
  }
}

async function isRunCompleted(threadId: string, runId: string) {
  try {
    const run = await openai.beta.threads.runs.retrieve(threadId, runId);
    const endStatuses = ["completed", "failed", "stopped", "requires_action"];

    if (endStatuses.includes(run.status)) {
      return run.required_action;
    }

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

function schedule_reminder(paramString: string) {
  try {
    const params = JSON.parse(paramString) as {
      datetime: string;
      text: string;
    };

    const { datetime, text } = params;
    return `Reminder scheduled for ${datetime} with the text: ${text}`;
  } catch (error) {
    console.error("Failed to schedule reminder", error);
    return "Failed to schedule reminder";
  }
}

const functions = {
  save_entry,
  schedule_reminder,
};

export async function askAgent(content: string) {
  try {
    const thread = await openai.beta.threads.create({
      messages: [
        {
          role: "user",
          content,
        },
      ],
    });

    const run = await openai.beta.threads.runs.create(thread.id, {
      assistant_id: process.env.OPENAI_ASSISTANT_ID || "",
      model: "gpt-4-1106-preview",
    });

    const action = await isRunCompleted(thread.id, run.id);
    const [fnCall] = action?.submit_tool_outputs.tool_calls || [];
    const fnName = fnCall.function.name;
    const callAtgs = fnCall?.function.arguments;

    if (fnName in functions) {
      const fn = functions[fnName as keyof typeof functions];
      if (typeof fn === "function") {
        return fn(callAtgs);
      }
    }
    return "Sorry, I did not understand that.";
  } catch (error) {
    console.error(error, "Failed to ask agent");
  }
}
