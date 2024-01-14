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
const deepgram_1 = require("./providers/deepgram");
const notion_1 = require("./providers/notion");
const TELEGRAM_TOKEN = process.env.TELEGRAM_API_KEY;
function handleVoiceMessage(bot, message) {
    return __awaiter(this, void 0, void 0, function* () {
        const { voice } = message;
        const file = yield bot.getFile(voice.file_id);
        const url = `https://api.telegram.org/file/bot${TELEGRAM_TOKEN}/${file.file_path}`;
        const transcript = yield (0, deepgram_1.transcribeUrl)(url);
        return transcript;
    });
}
function handleBotMessage(bot, message) {
    return __awaiter(this, void 0, void 0, function* () {
        let { text } = message;
        const { from, chat } = message;
        if (!from || !(0, whitelist_1.isWhitelisted)(from.username) || !(text || message.voice)) {
            return;
        }
        if (message.voice) {
            text = yield handleVoiceMessage(bot, message);
        }
        try {
            if (!text)
                return;
            const fnArgs = yield (0, openai_1.askAgent)(text);
            if (fnArgs) {
                yield (0, notion_1.notionCreatePage)(fnArgs);
                (0, telegram_1.botSendMessage)(bot, chat.id, fnArgs.summary);
            }
            else {
                (0, telegram_1.botSendMessage)(bot, chat.id, "Sorry, I did not understand that.");
            }
        }
        catch (error) {
            console.error(error);
            (0, telegram_1.botSendMessage)(bot, chat.id, "Sorry, I'm having trouble understanding you. Please try again.");
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
