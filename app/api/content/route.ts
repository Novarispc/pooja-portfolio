import { NextRequest, NextResponse } from "next/server";
import { readContent, writeContent } from "@/lib/content";

/** Admin-only (protected by middleware): full read of current content, draft or published. */
export async function GET() {
  const content = await readContent();
  return NextResponse.json(content, { headers: { "Cache-Control": "no-store" } });
}

/** Admin-only: saves content. Body: { content: SiteContent, publish: boolean } */
export async function PUT(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body || !body.content) {
    return NextResponse.json({ error: "Missing content payload" }, { status: 400 });
  }
  const saved = await writeContent(body.content, { publish: body.publish !== false });
  return NextResponse.json(saved);
}
