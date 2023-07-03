"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isWhitelisted = void 0;
if (!process.env.WHITELIST) {
    console.error("WHITELIST is not set");
    process.exit(1);
}
const WHITELIST = process.env.WHITELIST.split(",");
function isWhitelisted(username) {
    return !!username && WHITELIST.includes(username);
}
exports.isWhitelisted = isWhitelisted;
