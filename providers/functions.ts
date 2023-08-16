import fs from "fs";

const blueLightStatusFile: string = process.env.BLUE_LIGHT_STATUS_FILE || "";
const greenLightStatusFile: string = process.env.GREEN_LIGHT_STATUS_FILE || "";

function turn_off_blue_light() {
  try {
    fs.writeFileSync(blueLightStatusFile, "0");
  } catch (error) {
    console.error("Failed to turn off blue light");
  }
}

function turn_on_blue_light() {
  try {
    fs.writeFileSync(blueLightStatusFile, "1");
  } catch (error) {
    console.error("Failed to turn on blue light");
  }
}

function turn_off_green_light() {
  try {
    fs.writeFileSync(greenLightStatusFile, "0");
  } catch (error) {
    console.error("Failed to turn off green light");
  }
}

function turn_on_green_light() {
  try {
    fs.writeFileSync(greenLightStatusFile, "1");
  } catch (error) {
    console.error("Failed to turn on green light");
  }
}

const functionsMap: Record<string, CallableFunction> = {
  turn_off_blue_light,
  turn_on_blue_light,
  turn_off_green_light,
  turn_on_green_light,
};

export default function callFunctionByName(params?: {
  name?: string;
  arguments?: string;
}) {
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
