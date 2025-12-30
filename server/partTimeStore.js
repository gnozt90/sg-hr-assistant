import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

const DATA_DIR = path.join(process.cwd(), "server", "data");
const DATA_FILE = path.join(DATA_DIR, "part-time.json");

async function readJson() {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8");
    return JSON.parse(raw);
  } catch (error) {
    if (error.code === "ENOENT") {
      return [];
    }
    throw error;
  }
}

async function writeJson(data) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const tempFile = `${DATA_FILE}.tmp`;
  await fs.writeFile(tempFile, JSON.stringify(data, null, 2));
  await fs.rename(tempFile, DATA_FILE);
}

export async function ensureDataStore() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const exists = await readJson();
  if (!Array.isArray(exists)) {
    await writeJson([]);
  }
}

export async function listPartTimePosts() {
  const posts = await readJson();
  return posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export async function createPartTimePost(payload) {
  const posts = await readJson();
  const post = {
    id: crypto.randomUUID(),
    title: payload.title,
    pay: payload.pay,
    location: payload.location,
    schedule: payload.schedule || "",
    description: payload.description || "",
    contactName: payload.contactName || "",
    contactMethod: payload.contactMethod,
    contactValue: payload.contactValue,
    createdAt: new Date().toISOString(),
  };
  posts.push(post);
  await writeJson(posts);
  return post;
}
