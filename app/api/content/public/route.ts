import { NextResponse } from "next/server";
import { readContent } from "@/lib/content";

/** Public, unauthenticated: returns the currently published content only. */
export async function GET() {
  const content = await readContent();
  return NextResponse.json(content, {
    headers: { "Cache-Control": "no-store" },
  });
}
