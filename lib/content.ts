import { supabaseAdmin } from "./supabaseAdmin";
import { normalizeContent } from "./schema";
export type { SiteContent } from "./schema";
import type { SiteContent } from "./schema";

const BUCKET = "site-data";
const CONTENT_KEY = "content.json"; // published — what the public site reads
const DRAFT_KEY = "draft.json"; // in-progress admin edits, never read by the public site
const HISTORY_PREFIX = "history";
const MAX_SNAPSHOTS = 30;

/**
 * Content lives in Supabase Storage (private bucket, service-role access
 * only) rather than the local filesystem — Vercel's serverless functions
 * run on a read-only filesystem, so writes there never persist.
 *
 * Published and draft are two separate objects. The public site only ever
 * reads content.json; the admin dashboard reads draft.json if one exists,
 * falling back to the live published content otherwise. "Save Draft"
 * writes only to draft.json — it never touches what visitors see. "Publish"
 * writes to content.json (archiving the previous version to history first)
 * and then clears draft.json, since it's now redundant with what just went
 * live.
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

async function removeIfExists(path: string) {
  try {
    await supabaseAdmin.storage.from(BUCKET).remove([path]);
  } catch {
    /* non-critical cleanup — ignore */
  }
}

/** Published content only — what the public site (and /api/content/public) reads. */
export async function readContent(): Promise<SiteContent> {
  const raw = await downloadJson<unknown>(CONTENT_KEY);
  const normalized = raw ? normalizeContent(raw) : null;
  if (normalized) return normalized;
  const seed = await import("../data/seed.json");
  return seed.default as SiteContent;
}

/**
 * Draft-in-progress if one exists, otherwise falls back to the live
 * published content. Admin dashboard only. Also returns the published
 * document's own updatedAt separately — even while viewing a draft — so
 * the client can detect a stale Publish (comparing against content.json)
 * independently of a stale Save Draft (comparing against draft.json).
 * Conflating the two would false-positive every time: a draft's timestamp
 * and the published document's timestamp are never the same value.
 */
export async function readEditableContent(): Promise<{ content: SiteContent; publishedUpdatedAt: string | null }> {
  const publishedRaw = await downloadJson<unknown>(CONTENT_KEY);
  const publishedNormalized = publishedRaw ? normalizeContent(publishedRaw) : null;

  const draftRaw = await downloadJson<unknown>(DRAFT_KEY);
  const draftNormalized = draftRaw ? normalizeContent(draftRaw) : null;
  if (draftNormalized) {
    return { content: draftNormalized, publishedUpdatedAt: publishedNormalized?.meta?.updatedAt ?? null };
  }

  const published = publishedNormalized ?? (await readContent());
  return { content: published, publishedUpdatedAt: published.meta?.updatedAt ?? null };
}

type WriteResult = { ok: true; content: SiteContent } | { ok: false; reason: "conflict" };

export async function writeContent(
  content: SiteContent,
  opts: { publish: boolean; expectedUpdatedAt?: string }
): Promise<WriteResult> {
  const targetKey = opts.publish ? CONTENT_KEY : DRAFT_KEY;
  const current = await downloadJson<SiteContent>(targetKey);

  // Concurrency check: if the caller's copy is stale relative to what's
  // actually stored at the target key, refuse the overwrite rather than
  // silently clobbering whatever changed in between.
  if (opts.expectedUpdatedAt && current?.meta?.updatedAt && current.meta.updatedAt !== opts.expectedUpdatedAt) {
    return { ok: false, reason: "conflict" };
  }

  if (opts.publish) {
    // Archive the previous published version before overwriting it.
    const prevPublished = await downloadJson<SiteContent>(CONTENT_KEY);
    if (prevPublished) {
      const stamp = new Date().toISOString().replace(/[:.]/g, "-");
      await uploadJson(`${HISTORY_PREFIX}/${stamp}.json`, prevPublished);
      await pruneHistory();
    }
  }

  const next: SiteContent = {
    ...content,
    meta: { updatedAt: new Date().toISOString(), status: opts.publish ? "published" : "draft" },
  };
  await uploadJson(targetKey, next);

  // Publishing supersedes whatever draft was in progress — clear it so the
  // next admin load reads the freshly-published content, not a stale draft.
  if (opts.publish) {
    await removeIfExists(DRAFT_KEY);
  }

  return { ok: true, content: next };
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
  const raw = await downloadJson<unknown>(`${HISTORY_PREFIX}/${safe}`);
  const normalized = raw ? normalizeContent(raw) : null;
  if (!normalized) throw new Error("Snapshot not found or unreadable");
  return normalized;
}
