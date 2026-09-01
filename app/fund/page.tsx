import ContributionForm from "../contribution-form";

const paymentUrl = process.env.NEXT_PUBLIC_YOCO_PAYMENT_URL;
const qrUrl = paymentUrl ? `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(paymentUrl)}` : null;

export default function FundPage() {
  return <main className="engagement-page">
    <a className="back-home" href="/">← Back to homepage</a>
    <section className="engagement-hero">
      <p className="eyebrow">Support Dignity to Rise</p>
      <h1>There are many ways to make a difference.</h1>
      <p>You can support Dignity to Rise by donating money, giving your time, sharing your professional skills, contributing essential goods, or sponsoring a specific service. Choose the contribution that works best for you, and our team will contact you with the next steps.</p>
    </section>
    <ContributionForm paymentUrl={paymentUrl} />
    <section className="fund-layout fund-payment">
      <div>
        <h2>Secure monetary giving</h2>
        <p className="body-copy">Once you have saved your donation details, continue to Yoco’s protected checkout. Yoco processes the payment securely and provides the payment confirmation or receipt.</p>
      </div>
      <aside className="donation-card">
        <p className="eyebrow">Yoco payment</p>
        <h2>Donate with confidence</h2>
        {paymentUrl && qrUrl ? <>
          <a className="action-button" href={paymentUrl} target="_blank" rel="noreferrer">Donate securely with Yoco</a>
          <img className="donation-qr" src={qrUrl} alt="QR code for secure Yoco donation" />
          <p>Scan the QR code with your phone to open secure checkout.</p>
        </> : <>
          <p>Secure Yoco checkout is being connected. You can still offer another type of contribution above, or contact our team about a monetary gift.</p>
          <a className="text-action" href="mailto:ellie@dignitytorise.co.za?subject=Donation%20enquiry">Contact us about donating →</a>
        </>}
        <div className="bank-details">
          <p className="eyebrow">Bank transfer details</p>
          <p><strong>Dignity to Rise Movement</strong><br />Current Account<br />Access Bank Account no.: 62030000508<br />Branch code: 410105<br />Company registration: 2026/384909/07</p>
        </div>
      </aside>
    </section>
  </main>;
}
