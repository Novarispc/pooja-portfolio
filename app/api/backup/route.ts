import { NextRequest, NextResponse } from "next/server";
import { readEditableContent, writeContent, listHistory, readHistorySnapshot } from "@/lib/content";
import { validateImport } from "@/lib/schema";

/** Admin-only: GET ?list=1 -> history filenames; GET ?snapshot=<file> -> that snapshot; GET -> full export of the current draft-or-published content. */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  if (searchParams.get("list")) {
    const files = await listHistory();
    return NextResponse.json({ history: files });
  }

  const snapshot = searchParams.get("snapshot");
  if (snapshot) {
    try {
      const data = await readHistorySnapshot(snapshot);
      return NextResponse.json(data);
    } catch {
      return NextResponse.json({ error: "Snapshot not found" }, { status: 404 });
    }
  }

  const { content } = await readEditableContent();
  return NextResponse.json(content, {
    headers: { "Content-Disposition": `attachment; filename="portfolio-backup-${new Date().toISOString().slice(0, 10)}.json"` },
  });
}

/**
 * Admin-only: restore from an uploaded backup JSON. Body: a SiteContent-shaped
 * object. Validated against the content schema before writing — a
 * fundamentally malformed file is rejected with details instead of being
 * written through. Lands as a draft (never auto-published) so it can be
 * reviewed before going live.
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });

  const validated = validateImport(body);
  if (!validated.success) {
    const issues = validated.error.issues.slice(0, 5).map((i) => `${i.path.join(".") || "(root)"}: ${i.message}`);
    return NextResponse.json(
      { error: "This file doesn't match the expected content shape.", issues },
      { status: 400 }
    );
  }

  const result = await writeContent(validated.data, { publish: false });
  if (!result.ok) {
    return NextResponse.json({ error: "Import failed — please try again." }, { status: 409 });
  }
  return NextResponse.json(result.content);
}
