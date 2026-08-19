type Acknowledgement = { email: string; name?: string; formName: string };

export async function sendAcknowledgement({ email, name, formName }: Acknowledgement) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !from) return false;

  const greeting = name ? `Hi ${name},` : "Hello,";
  const text = `${greeting}\n\nThank you for completing the Dignity to Rise ${formName}. We have received your information.\n\nIf you have not heard from us, technology can sometimes be strange and glitchy, so please email Sybil or Ellie at dignitytorise@gmail.com.\n\nWarm regards,\nDignity to Rise Overstrand`;
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to: [email], subject: `Thank you from Dignity to Rise`, text })
  });
  return response.ok;
}
