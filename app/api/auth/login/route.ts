import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { username, password } = await req.json().catch(() => ({ username: "", password: "" }));

  const expectedUser = process.env.ADMIN_USERNAME;
  const expectedHash = process.env.ADMIN_PASSWORD_HASH;

  if (!expectedUser || !expectedHash) {
    return NextResponse.json(
      { error: "Admin credentials are not configured. See .env.local.example." },
      { status: 500 }
    );
  }

  const validUser = username === expectedUser;
  const validPass = validUser && (await bcrypt.compare(password ?? "", expectedHash));

  if (!validUser || !validPass) {
    // Constant-ish delay to discourage brute-force, matching reference architecture
    await new Promise((r) => setTimeout(r, 400));
    return NextResponse.json({ error: "Invalid username or password" }, { status: 401 });
  }

  await createSession(username);
  return NextResponse.json({ ok: true });
}
