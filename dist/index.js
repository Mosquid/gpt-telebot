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
require("dotenv").config();
const telegram_1 = require("./providers/telegram");
const whitelist_1 = require("./providers/whitelist");
const openai_1 = require("./providers/openai");
const postgres_1 = require("./providers/postgres");
const TELEGRAM_TOKEN = process.env.TELEGRAM_API_KEY;
function handleBotMessage(bot, message) {
    return __awaiter(this, void 0, void 0, function* () {
        const { from, text, chat } = message;
        if (!from || !(0, whitelist_1.isWhitelisted)(from.username) || !text) {
            return;
        }
        try {
            let history = yield (0, postgres_1.queryChatMessages)(message.chat.id);
            history = history || [];
            history.push({
                content: text,
                role: "user",
            });
            const generator = (0, openai_1.sendMessage)(history);
            if (!generator) {
                throw new Error("Failed to send message");
            }
            botStreamMessage(bot, message.chat.id, generator);
            yield (0, postgres_1.addChatMessage)({
                chatId: chat.id,
                content: text,
                role: "user",
            });
        }
        catch (error) {
            console.error(error);
            (0, telegram_1.botSendMessage)(bot, chat.id, "Sorry, I'm having trouble understanding you. Please try again.");
        }
    });
}
function botStreamMessage(bot, chatId, generator) {
    return __awaiter(this, void 0, void 0, function* () {
        let msgId;
        let lastValue;
        while (true) {
            const { value, done } = yield generator.next();
            if (!value || value === lastValue) {
                break;
            }
            lastValue = value;
            if (!msgId) {
                const msg = yield bot.sendMessage(chatId, value, {
                    parse_mode: "Markdown",
                });
                msgId = msg.message_id;
                continue;
            }
            yield bot.editMessageText(value, Object.assign({ chat_id: chatId, message_id: msgId, parse_mode: "Markdown" }, (done && {
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
            })));
            if (done) {
                yield (0, postgres_1.addChatMessage)({
                    chatId,
                    content: value,
                    role: "assistant",
                });
                break;
            }
        }
    });
}
function handleBotCallbackQuery(bot, query) {
    return __awaiter(this, void 0, void 0, function* () {
        const { data, message } = query;
        if (!data || !message || data !== "NEW") {
            return;
        }
        try {
            yield (0, postgres_1.deleteChatMessages)(message.chat.id);
            (0, telegram_1.botSendMessage)(bot, message.chat.id, "How can I help?");
        }
        catch (error) {
            (0, telegram_1.botSendMessage)(bot, message.chat.id, "Failed to start a new chat. Please try again.");
        }
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        if (!TELEGRAM_TOKEN) {
            console.error("TELEGRAM_TOKEN is not defined");
            process.exit(1);
        }
        const bot = (0, telegram_1.createBot)(TELEGRAM_TOKEN);
        bot.on("message", (message) => handleBotMessage(bot, message));
        bot.on("callback_query", (data) => handleBotCallbackQuery(bot, data));
    });
}
main();
