import { supabaseAdmin } from "./supabaseAdmin";

const BUCKET = "site-data";
const CONTENT_KEY = "content.json";
const HISTORY_PREFIX = "history";
const MAX_SNAPSHOTS = 30;

export type SiteContent = {
  hero: {
    coord: string;
    name: string;
    role: string;
    tagline: string;
    intro: string;
    colorPrimary?: string;
    colorSecondary?: string;
  };
  about: { title: string; quote: string; paragraphs: string[] };
  expertise: { title: string; desc: string }[];
  projects: { name: string; tag: string; loc: string; role: string; desc: string }[];
  experience: { date: string; role: string; company: string; desc: string }[];
  education: { flag: string; deg: string; sub: string; inst: string; meta: string }[];
  tools: { label: string; pills: string[] }[];
  contact: {
    title: string;
    intro: string;
    email: string;
    linkedinUrl: string;
    linkedinName: string;
    location: string;
    colorPrimary?: string;
    colorSecondary?: string;
  };
  footer: { copyright: string };
  milestones: { title: string; date: string; desc: string; img: string | null }[];
  portfolioProjects: { id: string; title: string; desc: string; files: { name: string; url: string; type: string }[] }[];
  avatarUrl: string | null;
  headerTextColor?: string;
  footerTextColor?: string;
  meta: { updatedAt: string; status: "draft" | "published" };
};

/**
 * Content is stored as a single JSON object in Supabase Storage (private
 * bucket, service-role access only) rather than the local filesystem —
 * Vercel's serverless functions run on a read-only filesystem, so writes
 * there never persist. Storage-backed reads/writes work identically on
 * localhost and on Vercel.
 */

/**
 * Reads via a raw fetch (not the SDK's storage.download()) so we can force
 * a cache-busting query param and no-cache headers — Supabase Storage sits
 * behind a CDN, and objects default to a 1hr Cache-Control unless
 * overridden, which was serving stale content right after a fresh publish.
 */
async function downloadJson<T>(path: string): Promise<T | null> {
  const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/${BUCKET}/${path}?t=${Date.now()}`;
  const res = await fetch(url, {
    headers: {
      apikey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
      Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      "Cache-Control": "no-cache",
    },
    cache: "no-store",
  });
  if (!res.ok) return null;
  const text = await res.text();
  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

async function uploadJson(path: string, value: unknown) {
  const body = JSON.stringify(value, null, 2);
  const { error } = await supabaseAdmin.storage.from(BUCKET).upload(path, body, {
    contentType: "application/json",
    cacheControl: "0",
    upsert: true,
  });
  if (error) throw error;
}

export async function readContent(): Promise<SiteContent> {
  const existing = await downloadJson<SiteContent>(CONTENT_KEY);
  if (existing) return existing;
  const seed = await import("../data/seed.json");
  return seed.default as SiteContent;
}

export async function writeContent(content: SiteContent, opts: { publish: boolean }) {
  // Archive the previous version before overwriting
  const prev = await downloadJson<SiteContent>(CONTENT_KEY);
  if (prev) {
    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    await uploadJson(`${HISTORY_PREFIX}/${stamp}.json`, prev);
    await pruneHistory();
  }

  const next: SiteContent = {
    ...content,
    meta: { updatedAt: new Date().toISOString(), status: opts.publish ? "published" : "draft" },
  };
  await uploadJson(CONTENT_KEY, next);
  return next;
}

async function pruneHistory() {
  const { data, error } = await supabaseAdmin.storage.from(BUCKET).list(HISTORY_PREFIX, {
    sortBy: { column: "name", order: "asc" },
  });
  if (error || !data) return;
  const excess = data.length - MAX_SNAPSHOTS;
  if (excess > 0) {
    const toRemove = data.slice(0, excess).map((f) => `${HISTORY_PREFIX}/${f.name}`);
    await supabaseAdmin.storage.from(BUCKET).remove(toRemove);
  }
}

export async function listHistory() {
  const { data, error } = await supabaseAdmin.storage.from(BUCKET).list(HISTORY_PREFIX, {
    sortBy: { column: "name", order: "desc" },
  });
  if (error || !data) return [];
  return data.map((f) => f.name);
}

export async function readHistorySnapshot(filename: string) {
  const safe = filename.replace(/[/\\]/g, ""); // prevent path traversal
  const snapshot = await downloadJson<SiteContent>(`${HISTORY_PREFIX}/${safe}`);
  if (!snapshot) throw new Error("Snapshot not found");
  return snapshot;
}
