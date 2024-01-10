// index.js (Node example)

const fs = require("fs");
const { createClient } = require("@deepgram/sdk");

const deepgramApiKey = process.env.DEEPGRAM_API_KEY || "";

// Transcribe an audio file from a URL:
export const transcribeUrl = async (url: string) => {
  const deepgram = createClient(deepgramApiKey);

  const { result, error } = await deepgram.listen.prerecorded.transcribeUrl(
    {
      url,
    },
    {
      smart_format: true,
      model: "nova-2",
    }
  );

  if (error) throw error;
  if (!error) console.dir(result, { depth: null });

  return result;
};

// Transcribe an audio file from a local file:
const transcribeFile = async () => {
  const deepgram = createClient(deepgramApiKey);

  const { result, error } = await deepgram.listen.prerecorded.transcribeFile(
    fs.readFileSync("./examples/nasa.mp4"),
    {
      smart_format: true,
      model: "nova",
    }
  );

  if (error) throw error;
  if (!error) console.dir(result, { depth: null });
};
