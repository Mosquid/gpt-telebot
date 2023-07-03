"use strict";
var __await = (this && this.__await) || function (v) { return this instanceof __await ? (this.v = v, this) : new __await(v); }
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __asyncGenerator = (this && this.__asyncGenerator) || function (thisArg, _arguments, generator) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var g = generator.apply(thisArg, _arguments || []), i, q = [];
    return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i;
    function verb(n) { if (g[n]) i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; }
    function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
    function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
    function fulfill(value) { resume("next", value); }
    function reject(value) { resume("throw", value); }
    function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendMessage = void 0;
const openai_1 = __importDefault(require("openai"));
const API_KEY = process.env.OPENAI_API_KEY;
const CHUNK_SIZE = 20;
const openai = new openai_1.default({
    apiKey: API_KEY,
});
const messages = [
    {
        role: "system",
        content: `Strictly avoid phrases that start with "As and AI model". If you can't tell, say that you can't. If you don't know say you don't know. If you don't understand, say you don't understand.`,
    },
];
function sendMessage(content) {
    return __asyncGenerator(this, arguments, function* sendMessage_1() {
        var _a, e_1, _b, _c;
        messages.push({
            role: "user",
            content,
        });
        const message = [];
        let yieldedTimes = 0;
        try {
            const response = yield __await(openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages,
                stream: true,
            }));
            try {
                for (var _d = true, response_1 = __asyncValues(response), response_1_1; response_1_1 = yield __await(response_1.next()), _a = response_1_1.done, !_a; _d = true) {
                    _c = response_1_1.value;
                    _d = false;
                    const part = _c;
                    const [chioce] = part.choices;
                    const { content } = chioce.delta || {};
                    message.push(content);
                    const yieldableChunks = Math.ceil(message.length / CHUNK_SIZE);
                    if (content && (!yieldedTimes || yieldableChunks > yieldedTimes)) {
                        yieldedTimes = yieldableChunks;
                        yield yield __await(message.join(""));
                        continue;
                    }
                    if (chioce.finish_reason === "stop") {
                        return yield __await(message.join(""));
                    }
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (!_d && !_a && (_b = response_1.return)) yield __await(_b.call(response_1));
                }
                finally { if (e_1) throw e_1.error; }
            }
        }
        catch (error) {
            console.error(error);
            throw new Error("Failed to send message");
        }
    });
}
exports.sendMessage = sendMessage;
