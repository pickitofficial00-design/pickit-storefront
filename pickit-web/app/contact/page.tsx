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
        <h1 style={{ fontSize: 34, margin: "8px 0" }}>Contact Us</h1>
        <p style={{ color: "#777", fontSize: 13, marginBottom: 28 }}>Last updated: November 2026</p>
        
  <p>Have a question about a product, order tracking, bulk orders, or returns? Our support team is happy to help.</p>

  <div style={{ background: "#f5f3ef", padding: 24, borderRadius: 12, margin: "24px 0" }}>
    <p style={{ margin: "0 0 10px 0" }}><strong>Customer Support Email:</strong> <a href="mailto:pickitofficial00@gmail.com" style={{ color: "#f26b21", fontWeight: 700 }}>pickitofficial00@gmail.com</a></p>
    <p style={{ margin: "0 0 10px 0" }}><strong>Response Time:</strong> Within 24 hours (Monday – Saturday)</p>
    <p style={{ margin: 0 }}><strong>Order & Tracking Lookup:</strong> <Link href="/account/orders" style={{ color: "#f26b21", fontWeight: 700 }}>Sign in to View Your Orders →</Link></p>
  </div>

  <h2>When Contacting Us About an Order</h2>
  <p>Please include your <strong>Order Number</strong> (e.g., #1001) and the email address used at checkout so we can assist you faster.</p>

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
