"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  async function submit(event: FormEvent) {
    event.preventDefault(); setSaving(true); setError("");
    const response = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password }) });
    setSaving(false);
    if (!response.ok) return setError("Incorrect password or missing admin configuration.");
    router.replace("/admin"); router.refresh();
  }
  return <main className="admin-login"><form onSubmit={submit}><p className="eyebrow">Dignity to Rise</p><h1>Admin portal</h1><p>Sign in to update your website content.</p><label>Admin password<input autoFocus type="password" value={password} onChange={(event) => setPassword(event.target.value)} required /></label>{error && <p className="admin-error">{error}</p>}<button disabled={saving}>{saving ? "Signing in…" : "Sign in"}</button></form></main>;
}
