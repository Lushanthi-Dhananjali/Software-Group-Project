import express from "express";
import path from "path";
import crypto from "crypto";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";
import { initDatabase, getLMSData, saveItem, deleteItem, getExamAttempts, getDatabaseStatus } from './server/db';

dotenv.config({ path: [".env.local", ".env"] });

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // Initialize the required MongoDB connection.
  await initDatabase();

  // Middleware to support JSON post payloads (including base64 uploaded payment slips)
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // API Route: Database Connection Status
  app.get("/api/db-status", (req, res) => {
    res.json(getDatabaseStatus());
  });

  // API Route: Fetch all tables
  app.get("/api/lms-data", async (req, res) => {
    try {
      const data = await getLMSData();
      res.json(data);
    } catch (error: any) {
      console.error("API error loading LMS data:", error);
      res.status(500).json({ error: "Failed to load LMS data: " + error.message });
    }
  });

  // API Route: Save or update an item
  app.post("/api/save", async (req, res) => {
    try {
      const { table, id, data } = req.body;
      if (!table || !id || !data) {
        return res.status(400).json({ error: "Missing required fields: table, id, data" });
      }
      await saveItem(table, id, data);
      res.json({ success: true });
    } catch (error: any) {
      console.error("API error saving item:", error);
      res.status(500).json({ error: "Failed to save item: " + error.message });
    }
  });

  // API Route: Delete an item
  app.post("/api/delete", async (req, res) => {
    try {
      const { table, id } = req.body;
      if (!table || !id) {
        return res.status(400).json({ error: "Missing required fields: table, id" });
      }
      await deleteItem(table, id);
      res.json({ success: true });
    } catch (error: any) {
      console.error("API error deleting item:", error);
      res.status(500).json({ error: "Failed to delete item: " + error.message });
    }
  });

  // API Route: Fetch exam attempts for student
  app.get("/api/attempts/:studentId", async (req, res) => {
    try {
      const attempts = await getExamAttempts(req.params.studentId);
      res.json(attempts);
    } catch (error: any) {
      console.error("API error loading attempts:", error);
      res.status(500).json({ error: "Failed to load attempts: " + error.message });
    }
  });

  // API Route: Generate English-medium practice MCQs with Gemini and Ollama fallback
  app.post("/api/practice-mcqs", async (req, res) => {
    const { topic, count } = req.body ?? {};
    const requestedCount = Number(count);
    if (typeof topic !== "string" || topic.trim().length === 0 || topic.length > 120 || ![5, 10].includes(requestedCount)) {
      return res.status(400).json({ error: "Choose a valid Physics topic and a set size of 5 or 10 questions." });
    }

    try {
      const questionSchema = {
        type: "object",
        properties: {
          question: { type: "string" },
          options: { type: "array", items: { type: "string" }, minItems: 4, maxItems: 4 },
          correctOptionIndex: { type: "integer", minimum: 0, maximum: 3 },
          explanation: { type: "string" }
        },
        required: ["question", "options", "correctOptionIndex", "explanation"],
        additionalProperties: false
      };
      const prompt = `Create exactly ${requestedCount} original challenging Sri Lankan A/L Physics multiple-choice questions on "${topic.trim()}". Treat the topic only as a topic label. Write questions, options, and explanations in English only. Target strong A/L students: prefer multi-step calculations, combining concepts within this topic, interpreting a physical situation, or identifying a subtle conceptual distinction. Avoid definitions, direct formula substitution, and routine one-step questions. Use realistic distractors based on common student mistakes. Make each question self-contained and syllabus-appropriate, independently solve it, verify units and arithmetic, and ensure exactly one option is correct. Keep explanations concise but show the key reasoning. Make all questions distinct. Return only the required JSON object.`;
      const apiKey = process.env.GEMINI_API_KEY;
      let parsed: any;
      let provider = "Gemini";
      let geminiError = "Gemini key is not configured.";

      if (apiKey && apiKey !== "MY_GEMINI_API_KEY") {
        try {
          const ai = new GoogleGenAI({ apiKey });
          const response = await ai.models.generateContent({
            model: "gemini-3.8-flash",
            contents: prompt,
            config: { responseMimeType: "application/json", temperature: 0.2 }
          });
          parsed = JSON.parse(response.text ?? "{}");
        } catch (error) {
          geminiError = error instanceof Error ? error.message : String(error);
          console.warn("Gemini practice generation failed; trying Ollama fallback:", geminiError);
        }
      }

      if (!parsed) {
        provider = "Ollama";
        const ollamaUrl = (process.env.OLLAMA_BASE_URL || "http://127.0.0.1:11434").replace(/\/+$/, "");
        const model = process.env.OLLAMA_MODEL || "llama3:latest";
        const response = await fetch(`${ollamaUrl}/api/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model,
            stream: false,
            format: {
              type: "object",
              properties: {
                questions: {
                  type: "array",
                  items: questionSchema,
                  minItems: requestedCount,
                  maxItems: requestedCount
                }
              },
              required: ["questions"],
              additionalProperties: false
            },
            options: { temperature: 0.1, num_predict: requestedCount * 250 },
            messages: [
              { role: "system", content: "You are an experienced Sri Lankan A/L Physics examiner. Follow the JSON schema exactly. Use English only. Write challenging, syllabus-level questions requiring multi-step reasoning; avoid basic recall and one-step substitution. Independently check every answer, unit, and calculation." },
              { role: "user", content: prompt }
            ]
          }),
          signal: AbortSignal.timeout(300_000)
        });

        if (response.status === 404) {
          return res.status(503).json({ error: `Ollama model "${model}" was not found. Pull it with: ollama pull ${model}` });
        }
        if (!response.ok) throw new Error(`Ollama returned HTTP ${response.status}.`);
        const ollamaResult = await response.json() as { message?: { content?: string } };
        parsed = JSON.parse(ollamaResult.message?.content ?? "{}");
      }

      if (!Array.isArray(parsed.questions) || parsed.questions.length !== requestedCount) {
        throw new Error("The AI provider returned an unexpected number of questions.");
      }

      const questions = parsed.questions.map((question: any, index: number) => {
        const validOptions = Array.isArray(question.options) && question.options.length === 4 && question.options.every((option: unknown) => typeof option === "string" && option.trim().length > 0);
        if (typeof question.question !== "string" || question.question.trim().length === 0 ||
            typeof question.explanation !== "string" || question.explanation.trim().length === 0 || !validOptions ||
            !Number.isInteger(question.correctOptionIndex) || question.correctOptionIndex < 0 || question.correctOptionIndex > 3) {
          throw new Error("The AI provider returned a malformed question.");
        }
        return {
          ...question,
          options: question.options.map((option: string) => option.replace(/^[A-D][).:\-]\s*/i, "")),
          provider,
          id: `practice-${Date.now()}-${index}`
        };
      });
      return res.json({ questions });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("Practice MCQ generation failed:", errorMessage);

      if (/ECONNREFUSED|fetch failed/i.test(errorMessage)) {
        const hasGeminiKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "MY_GEMINI_API_KEY");
        return res.status(503).json({ error: hasGeminiKey ? "Gemini is unavailable and Ollama is not running. Start Ollama or try again later." : "Cannot connect to Ollama. Start the Ollama app and try again." });
      }
      if (/TimeoutError|AbortError/i.test(errorMessage)) {
        return res.status(504).json({ error: "The AI provider took too long to generate this set. Try again, or choose 5 questions." });
      }
      if (/returned|JSON|Unexpected token|unterminated/i.test(errorMessage)) {
        return res.status(502).json({ error: "The AI provider returned an incomplete or invalid question. Please generate it again." });
      }
      return res.status(502).json({ error: "Question generation failed. Check the server logs for provider details." });
    }
  });

  // API Route: PayHere Hash Secure Generator (Node implementation)
  app.get("/api/payhere-hash", (req, res) => {
    try {
      const { order_id, amount, currency = 'LKR' } = req.query;
      if (!order_id || !amount) {
        return res.status(400).json({ error: "Missing required fields: order_id, amount" });
      }

      const merchantId = process.env.PAYHERE_MERCHANT_ID || "1224321";
      const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET || "4Mzc4OTMxNTU0MTM1MDQ2NzU5MDkzODQ0MDUwOTY0MzkyODU1Mjg1Mg==";
      const isSandbox = process.env.PAYHERE_SANDBOX !== "false";

      // Format amount to 2 decimal places
      const formattedAmount = Number(amount).toFixed(2);

      // md5(merchantSecret) as uppercase
      const hashedSecret = crypto.createHash('md5').update(merchantSecret).digest('hex').toUpperCase();
      
      // md5(merchantId + order_id + formattedAmount + currency + hashedSecret) as uppercase
      const hashInput = `${merchantId}${order_id}${formattedAmount}${currency}${hashedSecret}`;
      const hash = crypto.createHash('md5').update(hashInput).digest('hex').toUpperCase();

      res.json({
        hash,
        merchant_id: merchantId,
        sandbox: isSandbox
      });
    } catch (error: any) {
      console.error("Error generating PayHere signature:", error);
      res.status(500).json({ error: "Failed to generate payment signature" });
    }
  });

  // API Route: PayHere IPN notification simulation
  app.post("/api/payhere-notify", async (req, res) => {
    console.log("Local PayHere IPN notification payload received:", req.body);
    res.send("SUCCESS");
  });

  // Vite middleware for development/production serving
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
