import { createPool } from "@vercel/postgres";
import { Message } from "../types";

export interface ChatMessage {
  content: string;
  role: Message["role"];
  chatId: number;
}

if (!process.env.POSTGRES_URL) {
  console.error("Missing POSTGRES_URL");
  process.exit(1);
}

const pool = createPool({
  connectionString: process.env.POSTGRES_URL,
});

export async function addChatMessage(payload: ChatMessage) {
  const { chatId, content, role } = payload;
  const client = await pool.connect();
  try {
    return client.sql`INSERT INTO message_history (chat_id, content, role) VALUES (${chatId}, ${content}, ${role})`;
  } finally {
    client.release();
  }
}

export async function queryChatMessages(chatId: number) {
  const client = await pool.connect();
  try {
    const { rows } =
      await client.sql`SELECT content, role FROM message_history WHERE chat_id = ${chatId}`;

    return rows;
  } finally {
    client.release();
  }
}

export async function deleteChatMessages(chatId: number) {
  const client = await pool.connect();
  try {
    return client.sql`DELETE FROM message_history WHERE chat_id = ${chatId}`;
  } finally {
    client.release();
  }
}

async function init() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS message_history (
        id SERIAL PRIMARY KEY,
        chat_id BIGINT NOT NULL,
        content TEXT NOT NULL,
        role TEXT NOT NULL
      );
    `);
  } finally {
    client.release();
  }
}

init();
