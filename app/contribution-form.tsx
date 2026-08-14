"use client";

import { FormEvent, useState } from "react";

const options = [
  ["money", "Donate Money", "A once-off or recurring monetary donation"],
  ["time", "Donate Time", "Volunteer for programmes, events or community activities"],
  ["services", "Donate Professional Services", "Share counselling, legal, healthcare, training, marketing or technical skills"],
  ["goods", "Donate Goods", "Contribute food, clothing, sanitary products, learning materials or equipment"],
  ["sponsor", "Sponsor a Service or Delivery", "Cover transport, deliveries, meals, training, accommodation or another service"]
] as const;

export default function ContributionForm({ paymentUrl }: { paymentUrl?: string }) {
  const [type, setType] = useState<(typeof options)[number][0]>("money");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const selected = options.find(([value]) => value === type)!;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    setStatus("loading"); setMessage("");
    try {
      const response = await fetch("/api/enquiries", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ kind: "contribution", contributionType: type, ...Object.fromEntries(new FormData(form).entries()) }) });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error);
      form.reset();
      setStatus("success");
      setMessage(type === "money" && paymentUrl ? "Thank you. Continue to secure Yoco checkout to complete your donation and receive your payment confirmation." : "Thank you. Our team will contact you with the next steps.");
    } catch (error) { setStatus("error"); setMessage(error instanceof Error ? error.message : "We could not send your contribution details."); }
  }

  return <section className="contribution-form-wrap" id="contribute"><div className="contribution-types" role="tablist" aria-label="Contribution type">{options.map(([value, title]) => <button key={value} type="button" className={type === value ? "active" : ""} onClick={() => { setType(value); setStatus("idle"); }} role="tab" aria-selected={type === value}>{title}</button>)}</div><div className="contribution-copy"><p className="eyebrow">{selected[1]}</p><p>{selected[2]}</p></div><form className="engagement-form contribution-form" onSubmit={submit}>
    <label>Full name<input name="name" required /></label><label>Email address<input name="email" type="email" required /></label><label>Phone number<input name="phone" required /></label><label>Preferred contact method<select name="contactMethod" required defaultValue=""><option value="" disabled>Select a method</option><option>WhatsApp</option><option>Email</option><option>Phone call</option><option>SMS</option></select></label>
    <label className="form-wide">{type === "money" ? "Donation amount or monthly pledge" : type === "goods" ? "Goods and quantity" : "Contribution description"}<textarea name="description" rows={3} required placeholder={type === "money" ? "For example: R250 monthly" : "Tell us what you would like to contribute"} /></label>
    <label>Availability<select name="availability" required defaultValue=""><option value="" disabled>Select availability</option><option>Available now</option><option>Within the next month</option><option>On a specific date</option><option>Ongoing support</option></select></label><label>Organisation (optional)<input name="organisation" /></label>
    <button className="action-button" disabled={status === "loading"}>{status === "loading" ? "Sending…" : type === "money" ? "Save donation details" : "Offer this contribution"}</button>{type === "money" && paymentUrl && <a className="outline-action" href={paymentUrl} target="_blank" rel="noreferrer">Continue to secure Yoco payment</a>}{status !== "idle" && <p className={`engagement-status ${status}`} role="status">{message}</p>}
  </form></section>;
}
