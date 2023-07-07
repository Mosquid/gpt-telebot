"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteChatMessages = exports.queryChatMessages = exports.addChatMessage = void 0;
const postgres_1 = require("@vercel/postgres");
if (!process.env.POSTGRES_URL) {
    console.error("Missing POSTGRES_URL");
    process.exit(1);
}
const pool = (0, postgres_1.createPool)({
    connectionString: process.env.POSTGRES_URL,
});
function addChatMessage(payload) {
    return __awaiter(this, void 0, void 0, function* () {
        const { chatId, content, role } = payload;
        const client = yield pool.connect();
        try {
            return client.sql `INSERT INTO message_history (chat_id, content, role) VALUES (${chatId}, ${content}, ${role})`;
        }
        finally {
            client.release();
        }
    });
}
exports.addChatMessage = addChatMessage;
function queryChatMessages(chatId) {
    return __awaiter(this, void 0, void 0, function* () {
        const client = yield pool.connect();
        try {
            const { rows } = yield client.sql `SELECT content, role FROM message_history WHERE chat_id = ${chatId}`;
            return rows;
        }
        finally {
            client.release();
        }
    });
}
exports.queryChatMessages = queryChatMessages;
function deleteChatMessages(chatId) {
    return __awaiter(this, void 0, void 0, function* () {
        const client = yield pool.connect();
        try {
            return client.sql `DELETE FROM message_history WHERE chat_id = ${chatId}`;
        }
        finally {
            client.release();
        }
    });
}
exports.deleteChatMessages = deleteChatMessages;
function init() {
    return __awaiter(this, void 0, void 0, function* () {
        const client = yield pool.connect();
        try {
            yield client.query(`
      CREATE TABLE IF NOT EXISTS message_history (
        id SERIAL PRIMARY KEY,
        chat_id BIGINT NOT NULL,
        content TEXT NOT NULL,
        role TEXT NOT NULL
      );
    `);
        }
        finally {
            client.release();
        }
    });
}
init();
