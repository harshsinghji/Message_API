process.env.WWEBJS_NO_UPDATE_NOTIFY = true;
process.env.WWEBJS_CACHE_DIR = './wwebjs_cache';

import express from "express";
import pkg from "whatsapp-web.js";
const { Client, LocalAuth } = pkg;
import qrcode from "qrcode-terminal";

const app = express();
app.use(express.json());

// ✅ Add Puppeteer launch flags to fix "Running as root" error
const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
  },
});

client.on("qr", (qr) => {
  console.log("📱 Scan this QR code to log in:");
  qrcode.generate(qr, { small: true });
});

client.on("ready", () => {
  console.log("✅ WhatsApp client is ready!");
});

client.initialize();

// 📩 Single message
app.post("/send", async (req, res) => {
  const { phone, message } = req.body;
  if (!phone || !message)
    return res.status(400).json({ error: "phone and message required" });

  try {
    await client.sendMessage(`${phone}@c.us`, message);
    res.json({ success: true, message: "Message sent!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 📢 Bulk messages
app.post("/send-bulk", async (req, res) => {
  const { phones, message } = req.body;

  if (!phones || !Array.isArray(phones) || phones.length === 0 || !message)
    return res.status(400).json({ error: "phones (array) and message required" });

  let results = [];

  for (const phone of phones) {
    try {
      await client.sendMessage(`${phone}@c.us`, message);
      results.push({ phone, status: "✅ sent" });
    } catch (err) {
      results.push({ phone, status: "❌ failed", error: err.message });
    }
  }

  res.json({ success: true, results });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
