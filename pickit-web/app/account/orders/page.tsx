import "../account.css";
import { connection } from "next/server";
import Link from "next/link";
import { loadAccount } from "../../../lib/account";

export const instant = false;

export default async function OrdersPage() {
  await connection();
  const result = await loadAccount(false);

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
            <h1>Sign in to view orders</h1>
            <p>Log in with your PICKIT account email to view your order history.</p>
            <a href="/account/login" className="ac-primary-btn">Sign In →</a>
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
            <Link className="ac-back" href="/account">← Back to Account</Link>
          </div>
        </header>
        <main className="ac-main">
          <div className="ac-center-box">
            <h1>Unable to load orders</h1>
            <p>Please try again in a moment.</p>
            <Link href="/account" className="ac-primary-btn">Back to Account</Link>
          </div>
        </main>
      </div>
    );
  }

  const orders = result.customer.orders.nodes;

  return (
    <div className="ac-page">
      <header className="ac-header">
        <div className="ac-header-inner">
          <Link className="ac-logo" href="/">PICK<span>IT.</span></Link>
          <Link className="ac-back" href="/account">← My Account</Link>
        </div>
      </header>

      <main className="ac-main">
        <span className="ac-eyebrow">ORDER HISTORY</span>
        <h1 style={{ margin: "4px 0 0", fontSize: 28, letterSpacing: -0.8 }}>My Orders</h1>

        {orders.length === 0 ? (
          <div className="ac-center-box" style={{ marginTop: 28 }}>
            <div style={{ fontSize: 34 }}>🛍️</div>
            <h1>No orders yet</h1>
            <p>When you place an order on PICKIT, your tracking and receipt details will appear right here.</p>
            <Link href="/" className="ac-primary-btn">Explore Products →</Link>
          </div>
        ) : (
          <div className="ac-order-list">
            {orders.map((order) => {
              const payClass = (order.financialStatus || "").toLowerCase().includes("paid") ? "paid" : "";
              const fulClass = (order.fulfillmentStatus || "").toLowerCase().includes("fulfilled") ? "fulfilled" : "";
              return (
                <article className="ac-order-card" key={order.id}>
                  <div>
                    <h2>Order {order.name}</h2>
                    <p className="ac-order-meta">
                      Placed on {new Date(order.processedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </p>
                    <div className="ac-badges">
                      <span className={`ac-status ${payClass}`}>Payment: {order.financialStatus ?? "Pending"}</span>
                      <span className={`ac-status ${fulClass}`}>Delivery: {order.fulfillmentStatus ?? "Processing"}</span>
                    </div>
                  </div>
                  <div className="ac-order-total">
                    {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: order.totalPrice.currencyCode,
                    }).format(Number(order.totalPrice.amount))}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
