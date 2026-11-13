import Link from "next/link";

export default function Page() {
  return (
    <main style={{ minHeight: "100vh", background: "#ffffff", color: "#171717", fontFamily: "Arial, sans-serif" }}>
      <header style={{ padding: "20px 6%", borderBottom: "1px solid #eeeeee", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Link href="/" style={{ fontSize: 30, fontWeight: 900, color: "#171717", textDecoration: "none", letterSpacing: -1.5 }}>
          PICK<span style={{ color: "#f26b21" }}>IT.</span>
        </Link>
        <Link href="/" style={{ color: "#171717", fontWeight: 600, textDecoration: "none" }}>
          ← Back to Store
        </Link>
      </header>

      <article style={{ maxWidth: 800, margin: "48px auto", padding: "0 20px", lineHeight: 1.75 }}>
        <p style={{ color: "#f26b21", fontSize: 12, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase" }}>
          PICKIT STORE POLICIES
        </p>
        <h1 style={{ fontSize: 34, margin: "8px 0" }}>Refund & Return Policy</h1>
        <p style={{ color: "#777", fontSize: 13, marginBottom: 28 }}>Last updated: November 2026</p>
        
  <h2>1. 30-Day Return & Exchange Window</h2>
  <p>We offer a <strong>30-day return and exchange window</strong> from the date your order is delivered. To be eligible, items must be unused, in their original condition, and in original packaging.</p>

  <h2>2. Damaged, Defective, or Wrong Items</h2>
  <p>If your order arrives damaged, defective, or incorrect, email us within <strong>7 days of delivery</strong> at <a href="mailto:pickitofficial00@gmail.com" style={{ color: "#f26b21" }}>pickitofficial00@gmail.com</a> with your order number and clear photos/video of the issue. Our fulfillment team will arrange a free replacement or full refund.</p>

  <h2>3. How to Start a Return or Exchange</h2>
  <ol>
    <li>Email <a href="mailto:pickitofficial00@gmail.com" style={{ color: "#f26b21" }}>pickitofficial00@gmail.com</a> with your order number and reason for return or exchange.</li>
    <li>Our support and fulfillment team will provide the authorized return address and instructions.</li>
    <li>Do not send items back without first requesting return authorization.</li>
  </ol>

  <h2>4. Refund Processing</h2>
  <p>Once your return is received and inspected by our fulfillment center, we will notify you by email. Approved refunds are issued to your original payment method within <strong>5–10 business days</strong>.</p>

      </article>

      <footer style={{ background: "#171717", color: "white", textAlign: "center", padding: "36px 20px", marginTop: 60 }}>
        <div style={{ display: "flex", justifyContent: "center", gap: 20, flexWrap: "wrap", marginBottom: 16, fontSize: 13 }}>
          <Link href="/policies/shipping" style={{ color: "#ddd", textDecoration: "none" }}>Shipping Policy</Link>
          <Link href="/policies/refund" style={{ color: "#ddd", textDecoration: "none" }}>Refund & Return Policy</Link>
          <Link href="/policies/privacy" style={{ color: "#ddd", textDecoration: "none" }}>Privacy Policy</Link>
          <Link href="/policies/terms" style={{ color: "#ddd", textDecoration: "none" }}>Terms of Service</Link>
          <Link href="/contact" style={{ color: "#ddd", textDecoration: "none" }}>Contact Us</Link>
        </div>
        <small style={{ color: "#888" }}>© 2026 PICKIT. All rights reserved.</small>
      </footer>
    </main>
  );
}
