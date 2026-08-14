"use client";

import { FormEvent, useState } from "react";

type FormKind = "partner" | "mentor";

export default function EngagementForm({ kind }: { kind: FormKind }) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const isPartner = kind === "partner";

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    setStatus("loading");
    setMessage("");
    const fields = Object.fromEntries(new FormData(form).entries());
    try {
      const response = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind, ...fields })
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error);
      form.reset();
      setStatus("success");
      setMessage(isPartner ? "Thank you. Our partnership team will be in touch." : "Thank you. We’ll review your request and help find a suitable match.");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "We could not send your request. Please try again.");
    }
  }

  return <form className="engagement-form" onSubmit={submit}>
    <label>Full name<input name="name" required /></label>
    <label>Email address<input name="email" type="email" required /></label>
    <label>{isPartner ? "Organisation (if applicable)" : "Phone number (optional)"}<input name="organisation" /></label>
    <label>{isPartner ? "How would you like to partner?" : "What would you like help with?"}
      <select name="interest" required defaultValue="">
        <option value="" disabled>Select an option</option>
        {(isPartner ? ["Funding or sponsorship", "Venue, equipment or services", "NGO or community collaboration", "Employee volunteering", "Other"] : ["Starting or growing a business", "Career direction and job readiness", "Digital skills or remote work", "Agriculture and food production", "Trades and local services", "Personal wellbeing and confidence"]).map((option) => <option key={option}>{option}</option>)}
      </select>
    </label>
    <label className="form-wide">Tell us a little more<textarea name="message" rows={4} required /></label>
    <button className="action-button" disabled={status === "loading"}>{status === "loading" ? "Sending…" : isPartner ? "Send partnership enquiry" : "Request a mentor"}</button>
    {status !== "idle" && <p className={`engagement-status ${status}`} role="status">{message}</p>}
  </form>;
}
