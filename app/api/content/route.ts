import { NextRequest, NextResponse } from "next/server";
import { readEditableContent, writeContent } from "@/lib/content";

/**
 * Admin-only (protected by middleware): draft-in-progress if one exists,
 * otherwise the live published content. The published document's own
 * updatedAt is included as `_publishedUpdatedAt` — a transport-only field,
 * not part of the stored content shape — so the client can send it back
 * as the conflict-check reference specifically for Publish.
 */
export async function GET() {
  const { content, publishedUpdatedAt } = await readEditableContent();
  return NextResponse.json(
    { ...content, _publishedUpdatedAt: publishedUpdatedAt },
    { headers: { "Cache-Control": "no-store" } }
  );
}

/**
 * Admin-only: saves content. Body: { content: SiteContent, publish: boolean, expectedUpdatedAt?: string }
 * publish: false writes only to the draft — never visible on the public site.
 * expectedUpdatedAt, when provided, must match what's currently stored at the
 * target (draft or published) or the save is refused with 409 — prevents a
 * stale tab from silently overwriting a more recent save.
 */
export async function PUT(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body || !body.content) {
    return NextResponse.json({ error: "Missing content payload" }, { status: 400 });
  }
  const result = await writeContent(body.content, {
    publish: body.publish !== false,
    expectedUpdatedAt: body.expectedUpdatedAt,
  });
  if (!result.ok) {
    return NextResponse.json(
      { error: "conflict", message: "This content changed elsewhere since you loaded it. Reload the page to see the latest before saving." },
      { status: 409 }
    );
  }
  return NextResponse.json(result.content);
}
