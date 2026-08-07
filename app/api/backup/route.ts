import { NextRequest, NextResponse } from "next/server";
import { readContent, writeContent, listHistory, readHistorySnapshot } from "@/lib/content";

/** Admin-only: GET ?list=1 -> history filenames; GET ?snapshot=<file> -> that snapshot; GET -> full export. */
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

  const content = await readContent();
  return NextResponse.json(content, {
    headers: { "Content-Disposition": `attachment; filename="portfolio-backup-${new Date().toISOString().slice(0, 10)}.json"` },
  });
}

/** Admin-only: restore from an uploaded backup JSON. Body: full SiteContent object. */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  const saved = await writeContent(body, { publish: true });
  return NextResponse.json(saved);
}
