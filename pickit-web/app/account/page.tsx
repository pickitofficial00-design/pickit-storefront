import "./account.css";
import { connection } from "next/server";
import Link from "next/link";
import { loadAccount } from "../../lib/account";

export const instant = false;

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ refreshed?: string }>;
}) {
  await connection();

  const params = await searchParams;
  const result = await loadAccount(params.refreshed === "1");

  if (result.status === "signed-out") {
    return (
      <div className="ac-page">
        <header className="ac-header">
          <div className="ac-header-inner">
            <Link className="ac-logo" href="/">PICK<span>IT.</span></Link>
            <Link className="ac-back" href="/">← Back to Store</Link>
          </div>
        </header>
        <main className="ac-main">
          <div className="ac-center-box">
            <span className="ac-eyebrow">MEMBER ACCESS</span>
            <h1>Sign in to PICKIT</h1>
            <p>Access your order history, live shipment tracking, and saved account details.</p>
            <a href="/account/login" className="ac-primary-btn">Continue to Sign In →</a>
          </div>
        </main>
      </div>
    );
  }

  if (result.status === "error") {
    return (
      <div className="ac-page">
        <header className="ac-header">
          <div className="ac-header-inner">
            <Link className="ac-logo" href="/">PICK<span>IT.</span></Link>
            <Link className="ac-back" href="/">← Back to Store</Link>
          </div>
        </header>
        <main className="ac-main">
          <div className="ac-center-box">
            <h1>Unable to load account</h1>
            <p>Something interrupted your session. Please refresh or return to the store.</p>
            <Link href="/" className="ac-primary-btn">Return Home</Link>
          </div>
        </main>
      </div>
    );
  }

  const { customer } = result;
  const fullName = [customer.firstName, customer.lastName].filter(Boolean).join(" ").trim();
  const email = customer.emailAddress?.emailAddress ?? "No email available";
  const initial = (fullName || email || "P").charAt(0).toUpperCase();
  const orderCount = customer.orders?.nodes?.length ?? 0;

  return (
    <div className="ac-page">
      <header className="ac-header">
        <div className="ac-header-inner">
          <Link className="ac-logo" href="/">PICK<span>IT.</span></Link>
          <Link className="ac-back" href="/">← Continue Shopping</Link>
        </div>
      </header>

      <main className="ac-main">
        <section className="ac-hero-card">
          <div className="ac-user-left">
            <div className="ac-avatar">{initial}</div>
            <div>
              <span className="ac-eyebrow">PICKIT MEMBER</span>
              <h1>{fullName || "Welcome Back"}</h1>
              <p className="ac-email">{email}</p>
            </div>
          </div>

          <form action="/account/logout" method="POST">
            <button type="submit" className="ac-signout-btn">Sign Out</button>
          </form>
        </section>

        <section className="ac-grid">
          <Link href="/account/orders" className="ac-card">
            <div className="ac-card-top">
              <div className="ac-icon">📦</div>
              <span className="ac-pill">{orderCount} {orderCount === 1 ? "Order" : "Orders"}</span>
            </div>
            <div>
              <h2>Order History &amp; Tracking</h2>
              <p>Check order status, payment receipts, and shipment updates.</p>
            </div>
            <span className="ac-link-text">View My Orders →</span>
          </Link>

          <Link href="/cart" className="ac-card">
            <div className="ac-card-top">
              <div className="ac-icon">🛒</div>
              <span className="ac-pill">Bag</span>
            </div>
            <div>
              <h2>Your Shopping Cart</h2>
              <p>Review saved items and proceed to secure encrypted checkout.</p>
            </div>
            <span className="ac-link-text">Open Cart →</span>
          </Link>

          <Link href="/policies/shipping" className="ac-card">
            <div className="ac-card-top">
              <div className="ac-icon">🚚</div>
              <span className="ac-pill">6–12 Days US</span>
            </div>
            <div>
              <h2>Shipping &amp; Returns</h2>
              <p>Tracked US delivery and our 30-day hassle-free return policy.</p>
            </div>
            <span className="ac-link-text">Read Policies →</span>
          </Link>

          <Link href="/contact" className="ac-card">
            <div className="ac-card-top">
              <div className="ac-icon">💬</div>
              <span className="ac-pill">24h Reply</span>
            </div>
            <div>
              <h2>Customer Support</h2>
              <p>Need help with an order? Reach us anytime or tap the AI orb.</p>
            </div>
            <span className="ac-link-text">Contact Support →</span>
          </Link>
        </section>
      </main>
    </div>
  );
}
