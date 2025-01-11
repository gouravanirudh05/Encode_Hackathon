import fs from "fs";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: "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",
});

(async () => {
  try {
    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream("./speech.wav"),
      model: "whisper-1",
      response_format: "text",
    });

    console.log(transcription.text);
  } catch (error) {
    console.error("Error during transcription:", error);
  }
})();
