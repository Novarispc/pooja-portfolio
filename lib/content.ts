import { promises as fs } from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const CONTENT_PATH = path.join(DATA_DIR, "content.json");
const HISTORY_DIR = path.join(DATA_DIR, "history");
const MAX_SNAPSHOTS = 30;

export type SiteContent = {
  hero: { coord: string; name: string; role: string; tagline: string; intro: string };
  about: { title: string; quote: string; paragraphs: string[] };
  expertise: { title: string; desc: string }[];
  projects: { name: string; tag: string; loc: string; role: string; desc: string }[];
  experience: { date: string; role: string; company: string; desc: string }[];
  education: { flag: string; deg: string; sub: string; inst: string; meta: string }[];
  tools: { label: string; pills: string[] }[];
  contact: { title: string; intro: string; email: string; linkedinUrl: string; linkedinName: string; location: string };
  footer: { copyright: string };
  milestones: { title: string; date: string; desc: string; img: string | null }[];
  portfolioProjects: { id: string; title: string; desc: string; files: { name: string; url: string; type: string }[] }[];
  avatarUrl: string | null;
  meta: { updatedAt: string; status: "draft" | "published" };
};

/**
 * Vercel's serverless functions run on a read-only filesystem (only /tmp is
 * writable, and it isn't persistent or shared across invocations). Writes
 * here throw a tagged error the API routes turn into a clear 503 instead of
 * a raw filesystem crash.
 */
export const PERSISTENCE_UNAVAILABLE_MESSAGE =
  "Content editing isn't available on this deployment: Vercel's filesystem is read-only. " +
  "Run the app locally to edit and publish, or connect a persistent store (e.g. Vercel Blob + KV) for live editing on Vercel.";

function assertWritable() {
  if (process.env.VERCEL) {
    const err = new Error(PERSISTENCE_UNAVAILABLE_MESSAGE);
    err.name = "PersistenceUnavailableError";
    throw err;
  }
}

async function ensureDirs() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.mkdir(HISTORY_DIR, { recursive: true });
}

export async function readContent(): Promise<SiteContent> {
  try {
    const raw = await fs.readFile(CONTENT_PATH, "utf-8");
    return JSON.parse(raw);
  } catch {
    const seed = await import("../data/seed.json");
    return seed.default as SiteContent;
  }
}

export async function writeContent(content: SiteContent, opts: { publish: boolean }) {
  assertWritable();
  await ensureDirs();

  // Archive the previous version before overwriting
  try {
    const prev = await fs.readFile(CONTENT_PATH, "utf-8");
    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    await fs.writeFile(path.join(HISTORY_DIR, `${stamp}.json`), prev, "utf-8");
    await pruneHistory();
  } catch {
    /* no existing file yet — nothing to archive */
  }

  const next: SiteContent = {
    ...content,
    meta: { updatedAt: new Date().toISOString(), status: opts.publish ? "published" : "draft" },
  };
  await fs.writeFile(CONTENT_PATH, JSON.stringify(next, null, 2), "utf-8");
  return next;
}

async function pruneHistory() {
  const files = (await fs.readdir(HISTORY_DIR)).sort();
  const excess = files.length - MAX_SNAPSHOTS;
  if (excess > 0) {
    for (const f of files.slice(0, excess)) {
      await fs.unlink(path.join(HISTORY_DIR, f)).catch(() => {});
    }
  }
}

export async function listHistory() {
  await ensureDirs();
  const files = (await fs.readdir(HISTORY_DIR)).sort().reverse();
  return files;
}

export async function readHistorySnapshot(filename: string) {
  const safe = path.basename(filename); // prevent path traversal
  const raw = await fs.readFile(path.join(HISTORY_DIR, safe), "utf-8");
  return JSON.parse(raw) as SiteContent;
}
