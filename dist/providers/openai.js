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
exports.askAgent = exports.sendMessage = void 0;
const openai_1 = __importDefault(require("openai"));
const functions_1 = __importDefault(require("./functions"));
const API_KEY = process.env.OPENAI_API_KEY;
const CHUNK_SIZE = 20;
const openai = new openai_1.default({
    apiKey: API_KEY,
});
function sendMessage(history) {
    return __asyncGenerator(this, arguments, function* sendMessage_1() {
        var _a, e_1, _b, _c;
        const messages = [
            {
                role: "system",
                content: `Strictly avoid phrases that start with "As and AI model". If you can't tell, say that you can't. If you don't know say you don't know. If you don't understand, say you don't understand.`,
            },
            ...history,
        ];
        const message = [];
        let yieldedTimes = 0;
        try {
            const response = yield __await(openai.chat.completions.create({
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
            }));
            try {
                for (var _d = true, response_1 = __asyncValues(response), response_1_1; response_1_1 = yield __await(response_1.next()), _a = response_1_1.done, !_a; _d = true) {
                    _c = response_1_1.value;
                    _d = false;
                    const part = _c;
                    const [chioce] = part.choices;
                    const { content, function_call } = chioce.delta || {};
                    if (function_call) {
                        (0, functions_1.default)(function_call);
                        return yield __await("Sure! My pleasure.");
                    }
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
function isRunCompleted(threadId, runId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const run = yield openai.beta.threads.runs.retrieve(threadId, runId);
            const endStatuses = ["completed", "failed", "stopped", "requires_action"];
            if (endStatuses.includes(run.status)) {
                return run.required_action;
            }
            yield new Promise((resolve) => setTimeout(resolve, 500));
            return isRunCompleted(threadId, runId);
        }
        catch (error) {
            console.error(error, "Failed to check thread status");
        }
    });
}
function askAgent(content) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const thread = yield openai.beta.threads.create({
                messages: [
                    {
                        role: "user",
                        content,
                    },
                ],
            });
            const run = yield openai.beta.threads.runs.create(thread.id, {
                assistant_id: process.env.OPENAI_ASSISTANT_ID || "",
                model: "gpt-4-1106-preview",
            });
            const action = yield isRunCompleted(thread.id, run.id);
            const [fnCall] = (action === null || action === void 0 ? void 0 : action.submit_tool_outputs.tool_calls) || [];
            const callAtgs = fnCall === null || fnCall === void 0 ? void 0 : fnCall.function.arguments;
            return JSON.parse(callAtgs);
        }
        catch (error) {
            console.error(error, "Failed to ask agent");
        }
    });
}
exports.askAgent = askAgent;
