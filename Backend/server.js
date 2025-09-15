import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

// ✅ Use OpenRouter instead of OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1", // 👈 Required for OpenRouter
});

// Chat endpoint
app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body;

    const completion = await openai.chat.completions.create({
      model: "openai/gpt-4o-mini", // ✅ OpenRouter model format
      messages: [{ role: "user", content: message }],
    });

    const reply = completion.choices[0].message.content;
    res.json({ reply });
  } catch (error) {
    console.error("OpenRouter Error:", error);

    res.status(500).json({
      reply: "⚠️ Oops! Something went wrong with AI.",
      error: error.message,
    });
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`✅ OpenRouter server running at http://localhost:${PORT}`);
});
