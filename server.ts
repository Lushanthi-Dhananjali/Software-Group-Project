import express from "express";
import path from "path";
import crypto from "crypto";
import { createServer as createViteServer } from "vite";
import { initDatabase, getLMSData, saveItem, deleteItem, getExamAttempts, getMySqlStatus } from './server/db';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Initialize Database (detects MySQL or falls back to local file)
  await initDatabase();

  // Middleware to support JSON post payloads (including base64 uploaded payment slips)
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // API Route: Database Connection Status
  app.get("/api/db-status", (req, res) => {
    res.json(getMySqlStatus());
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
