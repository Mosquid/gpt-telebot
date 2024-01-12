"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const blueLightStatusFile = process.env.BLUE_LIGHT_STATUS_FILE || "";
const greenLightStatusFile = process.env.GREEN_LIGHT_STATUS_FILE || "";
function turn_off_blue_light() {
    try {
        fs_1.default.writeFileSync(blueLightStatusFile, "0");
    }
    catch (error) {
        console.error("Failed to turn off blue light");
    }
}
function turn_on_blue_light() {
    try {
        fs_1.default.writeFileSync(blueLightStatusFile, "1");
    }
    catch (error) {
        console.error("Failed to turn on blue light");
    }
}
function turn_off_green_light() {
    try {
        fs_1.default.writeFileSync(greenLightStatusFile, "0");
    }
    catch (error) {
        console.error("Failed to turn off green light");
    }
}
function turn_on_green_light() {
    try {
        fs_1.default.writeFileSync(greenLightStatusFile, "1");
    }
    catch (error) {
        console.error("Failed to turn on green light");
    }
}
const functionsMap = {
    turn_off_blue_light,
    turn_on_blue_light,
    turn_off_green_light,
    turn_on_green_light,
};
function callFunctionByName(params) {
    if (!params) {
        return;
    }
    const { name } = params;
    if (!name) {
        return;
    }
    const fn = functionsMap[name];
    if (!fn || typeof fn !== "function") {
        console.log("Function not found");
    }
    return fn();
}
exports.default = callFunctionByName;
