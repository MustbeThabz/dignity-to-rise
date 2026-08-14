import { NextResponse } from "next/server";
import { adminCookie, validAdminPassword } from "../../../lib/admin-auth";
export async function POST(request: Request) {
  const { password } = await request.json();
  if (typeof password !== "string" || !validAdminPassword(password)) return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
  const response = NextResponse.json({ ok: true }); response.headers.set("Set-Cookie", adminCookie()); return response;
}
