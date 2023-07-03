"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBot = void 0;
const node_telegram_bot_api_1 = __importDefault(require("node-telegram-bot-api"));
function createBot(token) {
    return new node_telegram_bot_api_1.default(token, { polling: true });
}
exports.createBot = createBot;
