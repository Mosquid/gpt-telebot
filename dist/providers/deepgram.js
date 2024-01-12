"use strict";
// index.js (Node example)
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
exports.transcribeUrl = void 0;
const fs = require("fs");
const { createClient } = require("@deepgram/sdk");
const deepgramApiKey = process.env.DEEPGRAM_API_KEY || "";
// Transcribe an audio file from a URL:
const transcribeUrl = (url) => __awaiter(void 0, void 0, void 0, function* () {
    const deepgram = createClient(deepgramApiKey);
    const { result, error } = yield deepgram.listen.prerecorded.transcribeUrl({
        url,
    }, {
        smart_format: true,
        model: "nova-2",
    });
    if (error)
        throw error;
    if (!error)
        console.dir(result, { depth: null });
    return result;
});
exports.transcribeUrl = transcribeUrl;
// Transcribe an audio file from a local file:
const transcribeFile = () => __awaiter(void 0, void 0, void 0, function* () {
    const deepgram = createClient(deepgramApiKey);
    const { result, error } = yield deepgram.listen.prerecorded.transcribeFile(fs.readFileSync("./examples/nasa.mp4"), {
        smart_format: true,
        model: "nova",
    });
    if (error)
        throw error;
    if (!error)
        console.dir(result, { depth: null });
});
