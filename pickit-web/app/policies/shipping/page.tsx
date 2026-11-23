import Link from "next/link";
export default function Page() {
  return (
    <main style={{ minHeight: "100vh", background: "#fff", color: "#171717", fontFamily: "Arial, sans-serif" }}>
      <header style={{ padding: "20px 6%", borderBottom: "1px solid #eee", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Link href="/" style={{ fontSize: 30, fontWeight: 900, color: "#171717", textDecoration: "none", letterSpacing: -1.5 }}>PICK<span style={{ color: "#f26b21" }}>IT.</span></Link>
        <Link href="/" style={{ color: "#171717", fontWeight: 600, textDecoration: "none" }}>&larr; Back to Store</Link>
      </header>
      <article style={{ maxWidth: 800, margin: "48px auto", padding: "0 20px", lineHeight: 1.75 }}>
        <p style={{ color: "#f26b21", fontSize: 12, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase" }}>PICKIT STORE POLICIES</p>
        <h1 style={{ fontSize: 34, margin: "8px 0" }}>Shipping Policy</h1>
        <p style={{ color: "#777", fontSize: 13, marginBottom: 28 }}>Last updated: November 2026</p>
        <p>Thank you for shopping at PICKIT (pickitcart.com).</p>
        <h2>1. Order Processing Time</h2><p>All orders are processed and packed within <strong>1-3 business days</strong> (excluding weekends and holidays) after payment confirmation.</p>
        <h2>2. Estimated Delivery Times (United States)</h2><ul>
        <li><strong>Economy Tracked Shipping:</strong> 6-12 business days</li>
        <li><strong>Standard Tracked Shipping:</strong> 4-7 business days</li>
        <li><strong>Express Shipping:</strong> 3-4 business days</li></ul>
        <h2>3. Tracking &amp; Multi-Item Orders</h2><p>Items in the same order may ship separately with individual tracking numbers at no extra cost. Track orders anytime in your <Link href="/account/orders" style={{ color: "#f26b21" }}>PICKIT Account</Link>.</p>
        <h2>4. Undeliverable Packages</h2><p>Orders returned due to an incorrect checkout address or unclaimed parcel require a <strong>$15 USD redelivery fee</strong> to reship.</p>
        <h2>5. Contact Us</h2><p>Email: <a href="mailto:support@pickitcart.com" style={{ color: "#f26b21" }}>support@pickitcart.com</a><br />Business Address: Kozhikode, Kerala, India</p>
      </article>
      <footer style={{ background: "#171717", color: "white", textAlign: "center", padding: "36px 20px", marginTop: 60 }}>
        <div style={{ display: "flex", justifyContent: "center", gap: 20, flexWrap: "wrap", marginBottom: 16, fontSize: 13 }}>
          <Link href="/policies/shipping" style={{ color: "#ddd", textDecoration: "none" }}>Shipping Policy</Link>
          <Link href="/policies/refund" style={{ color: "#ddd", textDecoration: "none" }}>Refund &amp; Return Policy</Link>
          <Link href="/policies/privacy" style={{ color: "#ddd", textDecoration: "none" }}>Privacy Policy</Link>
          <Link href="/policies/terms" style={{ color: "#ddd", textDecoration: "none" }}>Terms of Service</Link>
          <Link href="/policies/legal" style={{ color: "#ddd", textDecoration: "none" }}>Legal Notice</Link>
          <Link href="/contact" style={{ color: "#ddd", textDecoration: "none" }}>Contact Us</Link>
        </div>
        <small style={{ color: "#888" }}>&copy; 2026 PICKIT &bull; Kozhikode, Kerala, India &bull; support@pickitcart.com</small>
      </footer>
    </main>
  );
}
