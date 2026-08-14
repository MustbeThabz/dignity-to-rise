"use client";

import { FormEvent, useState } from "react";

const frequencies = ["Once-off", "Occasionally (as needed)", "Monthly", "Weekly", "More than once a week"] as const;
const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const causes = ["Children", "Youth", "Families", "Older Persons", "People with Disabilities", "Animals", "Nature & Environment", "Food & Hunger Relief", "Health & Wellness", "Education & Learning", "Community Projects", "Emergency Relief", "I'm happy to help wherever I'm needed", "Other"];
const contactMethods = ["WhatsApp", "Email", "Phone Call", "SMS"] as const;

function Check({ name, value, label }: { name: string; value: string; label: string }) {
  return <label className="form-check volunteer-check"><input className="form-check-input" type="checkbox" name={name} value={value} /><span className="form-check-label">{label}</span></label>;
}

export default function VolunteerForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    const values = new FormData(form);
    const frequency = values.getAll("frequency").map(String);
    const selectedCauses = values.getAll("causes").map(String);
    const selectedContactMethods = values.getAll("contactMethods").map(String);
    const availability = Object.fromEntries(days.map((day) => [day, values.getAll(`availability-${day}`).map(String)]));
    const payload = {
      firstName: values.get("firstName"), surname: values.get("surname"), email: values.get("email"),
      cellNumber: values.get("cellNumber"), suburb: values.get("suburb"), frequency, availability,
      causes: selectedCauses, otherSupport: values.get("otherSupport"), contactMethods: selectedContactMethods,
      consent: values.get("consent") === "yes"
    };
    setStatus("loading");
    setMessage("");
    try {
      const response = await fetch("/api/volunteers", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error);
      form.reset();
      setStatus("success");
      setMessage("Thank you. Your volunteer registration has been submitted.");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Unable to submit the form.");
    }
  }

  return <div className="volunteer-shell">
    <header className="form-heading">
      <p className="eyebrow">Dignity to Rise Overstrand</p>
      <h1>Overstrand Volunteer Registration Form</h1>
      <p>Thank you for your willingness to make a difference in the Overstrand. Complete this form to join our volunteer database.</p>
    </header>
    <form onSubmit={submit} className="volunteer-form" noValidate>
      <section>
        <h2>Section 1: Your Details</h2>
        <div className="details-grid">
          {[['firstName', 'First Name', 'text'], ['surname', 'Surname', 'text'], ['email', 'Email Address', 'email'], ['cellNumber', 'Cell Number', 'tel'], ['suburb', 'Suburb / Town', 'text']].map(([name, label, type]) => <div key={name}>
            <label htmlFor={name}>{label}</label><input id={name} name={name} type={type} required />
          </div>)}
        </div>
      </section>

      <section>
        <h2>Section 2: When can you volunteer?</h2>
        <p className="section-copy">How often would you like to volunteer?</p>
        <div className="checks-stack">{frequencies.map((item) => <Check key={item} name="frequency" value={item} label={item} />)}</div>
        <p className="section-copy availability-label">Availability (tick all that apply):</p>
        <div className="table-responsive"><table className="table availability-table"><thead><tr><th>Day</th><th>Morning</th><th>Afternoon</th><th>Evening</th></tr></thead><tbody>
          {days.map((day) => <tr key={day}><th scope="row">{day}</th>{["morning", "afternoon", "evening"].map((time) => <td key={time}><label className="cell-check"><input type="checkbox" name={`availability-${day}`} value={time} aria-label={`${day} ${time}`} /></label></td>)}</tr>)}
        </tbody></table></div>
      </section>

      <section><h2>Section 3: What causes would you like to support?</h2><div className="causes-grid">{causes.map((cause) => <Check key={cause} name="causes" value={cause} label={cause} />)}</div></section>
      <section><h2>Section 4: Other ways you can contribute</h2><label htmlFor="otherSupport" className="section-copy">Skills, experience, qualifications, equipment, vehicles, venues, donations or other support:</label><textarea id="otherSupport" name="otherSupport" rows={4} /></section>
      <section><h2>Section 5: Preferred contact method</h2><div className="checks-stack">{contactMethods.map((method) => <Check key={method} name="contactMethods" value={method} label={method} />)}</div></section>
      <section><h2>Consent</h2><label className="form-check volunteer-check consent"><input className="form-check-input" type="checkbox" name="consent" value="yes" required /><span className="form-check-label">I consent to my information being stored and shared with trusted NGOs and community organisations in the Overstrand solely to match me with suitable volunteer opportunities.</span></label></section>
      <button className="submit-button" disabled={status === "loading"} type="submit">{status === "loading" ? "Submitting..." : "Submit Registration"}</button>
      {status !== "idle" && <p className={`form-status ${status}`} role="status">{message}</p>}
    </form>
  </div>;
}
