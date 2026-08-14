import { createHmac, timingSafeEqual } from "crypto";

const cookieName = "d2r_admin";

function signature() {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) throw new Error("ADMIN_SESSION_SECRET is not configured.");
  return createHmac("sha256", secret).update("d2r-admin-session-v1").digest("hex");
}

export function validAdminPassword(password: string) {
  return Boolean(process.env.ADMIN_PASSWORD) && password === process.env.ADMIN_PASSWORD;
}

export function adminCookie() {
  return `${cookieName}=${signature()}; Path=/; HttpOnly; SameSite=Lax; Max-Age=28800${process.env.NODE_ENV === "production" ? "; Secure" : ""}`;
}

export function clearAdminCookie() {
  return `${cookieName}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}

export function isAdmin(cookieHeader: string | null | undefined) {
  // Local preview is intentionally frictionless. Production always requires the signed session.
  if (process.env.NODE_ENV === "development") return true;
  try {
    const value = cookieHeader?.match(new RegExp(`(?:^|; )${cookieName}=([^;]+)`))?.[1];
    if (!value) return false;
    const expected = signature();
    return value.length === expected.length && timingSafeEqual(Buffer.from(value), Buffer.from(expected));
  } catch {
    return false;
  }
}
