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
exports.botStreamMessage = void 0;
const postgres_1 = require("./providers/postgres");
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
exports.botStreamMessage = botStreamMessage;
