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
        <h1 style={{ fontSize: 34, margin: "8px 0" }}>Terms of Service</h1>
        <p style={{ color: "#777", fontSize: 13, marginBottom: 28 }}>Last updated: November 2026</p>
        
  <h2>1. Overview</h2>
  <p>This website is operated by PICKIT. By accessing our storefront or purchasing from PICKIT, you agree to be bound by these Terms of Service and our store policies.</p>

  <h2>2. Products & Pricing</h2>
  <p>All prices are listed in USD unless stated otherwise at checkout. We reserve the right to update product descriptions, pricing, or availability at any time without prior notice.</p>

  <h2>3. Orders & Fulfillment</h2>
  <p>We reserve the right to limit quantities or cancel orders if fraud, unauthorized reselling, or inaccurate pricing is detected. If an order is canceled after payment, a full refund will be issued immediately.</p>

  <h2>4. Intellectual Property</h2>
  <p>All PICKIT branding, logos, product photography, and website content are the property of PICKIT and may not be reproduced without written permission.</p>

  <h2>5. Contact Information</h2>
  <p>Questions about these Terms of Service can be sent to <a href="mailto:pickitofficial00@gmail.com" style={{ color: "#f26b21" }}>pickitofficial00@gmail.com</a>.</p>

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
