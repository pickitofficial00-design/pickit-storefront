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
        <h1 style={{ fontSize: 34, margin: "8px 0" }}>Legal Notice</h1>
        <p style={{ color: "#777", fontSize: 13, marginBottom: 28 }}>Last updated: November 2026</p>
        <h2>1. Business Operator</h2><p><strong>Business Name:</strong> PICKIT<br /><strong>Website:</strong> https://pickitcart.com<br /><strong>Email:</strong> <a href="mailto:support@pickitcart.com" style={{ color: "#f26b21" }}>support@pickitcart.com</a><br /><strong>Registered Location:</strong> Kozhikode, Kerala, India</p>
        <h2>2. Intellectual Property &amp; Governing Law</h2><p>All content on pickitcart.com belongs to PICKIT or its licensors. PICKIT participates in affiliate programs including Amazon Associates. Any disputes are governed by the laws of India.</p>
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
