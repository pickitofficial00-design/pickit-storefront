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
        <h1 style={{ fontSize: 34, margin: "8px 0" }}>Shipping Policy</h1>
        <p style={{ color: "#777", fontSize: 13, marginBottom: 28 }}>Last updated: November 2026</p>
        
  <h2>1. Order Processing Time</h2>
  <p>All orders are processed and dispatched through our global fulfillment partners within <strong>1–3 business days</strong> (excluding weekends and public holidays) after payment confirmation.</p>

  <h2>2. Estimated Delivery Times</h2>
  <ul>
    <li><strong>United States (Standard Tracked Shipping):</strong> 6–12 business days after dispatch.</li>
    <li><strong>International Destinations:</strong> 8–18 business days depending on local customs clearance.</li>
  </ul>

  <h2>3. Order Tracking</h2>
  <p>Once your order ships, you will receive an email notification containing your tracking number and carrier link. You can also check order status anytime in your <Link href="/account/orders" style={{ color: "#f26b21" }}>PICKIT Account</Link>.</p>

  <h2>4. Customs, Duties & Taxes</h2>
  <p>Applicable taxes and shipping charges are calculated at checkout. For international orders outside the United States, local import duties or customs fees may apply based on your country&apos;s regulations.</p>

  <h2>5. Questions</h2>
  <p>Need help with a shipment? Contact us at <a href="mailto:pickitofficial00@gmail.com" style={{ color: "#f26b21" }}>pickitofficial00@gmail.com</a>.</p>

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
