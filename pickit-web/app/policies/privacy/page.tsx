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
        <h1 style={{ fontSize: 34, margin: "8px 0" }}>Privacy Policy</h1>
        <p style={{ color: "#777", fontSize: 13, marginBottom: 28 }}>Last updated: November 2026</p>
        
  <h2>1. Information We Collect</h2>
  <p>When you browse PICKIT, create an account, or place an order, we collect necessary order and contact details such as your name, email address, shipping/billing address, and order history. Payment details are processed securely through Shopify&apos;s encrypted checkout and PCI-compliant payment providers—PICKIT never stores your full card number.</p>

  <h2>2. How We Use Your Information</h2>
  <ul>
    <li>Process, fulfill, and ship your orders through Shopify and our authorized fulfillment partners.</li>
    <li>Send order confirmations, tracking updates, and customer support responses.</li>
    <li>Prevent fraud and maintain store security.</li>
  </ul>

  <h2>3. Data Sharing</h2>
  <p>We share order information strictly with essential service providers required to operate your purchase—such as Shopify (commerce & checkout platform) and our logistics/fulfillment carriers. We do not sell your personal information.</p>

  <h2>4. Your Rights & Contact</h2>
  <p>You may request access to, correction of, or deletion of your personal data at any time by contacting <a href="mailto:pickitofficial00@gmail.com" style={{ color: "#f26b21" }}>pickitofficial00@gmail.com</a>.</p>

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
