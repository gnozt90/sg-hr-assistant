import "dotenv/config";
import express from "express";
import cors from "cors";
import { fetchJobs } from "./jobs.js";
import {
  ensureDataStore,
  listPartTimePosts,
  createPartTimePost,
} from "./partTimeStore.js";
import { openaiChat } from "./openai.js";

const app = express();
const port = process.env.PORT || 8787;
const corsOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",")
  : ["http://localhost:5173"];

app.use(cors({ origin: corsOrigins }));
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.get("/api/jobs", async (req, res) => {
  const query = String(req.query.query || "").trim();
  if (!query) {
    res.status(400).json({ error: "Missing query." });
    return;
  }

  try {
    const results = await fetchJobs(query);
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/part-time", async (req, res) => {
  const posts = await listPartTimePosts();
  res.json({ posts });
});

app.post("/api/part-time", async (req, res) => {
  const payload = req.body || {};
  const requiredFields = ["title", "pay", "location", "contactMethod", "contactValue"];
  const missing = requiredFields.filter((field) => !String(payload[field] || "").trim());
  if (missing.length) {
    res.status(400).json({ error: `Missing fields: ${missing.join(", ")}` });
    return;
  }

  const post = await createPartTimePost(payload);
  res.status(201).json({ post });
});

app.post("/api/chat", async (req, res) => {
  const message = String(req.body?.message || "").trim();
  if (!message) {
    res.status(400).json({ error: "Message is required." });
    return;
  }

  const result = await openaiChat(message, req.body?.history || []);
  if (!result.success) {
    res.status(500).json({ error: result.error || "Chat request failed." });
    return;
  }
  res.json(result);
});

await ensureDataStore();

app.listen(port, () => {
  console.log(`API server running on http://localhost:${port}`);
});
