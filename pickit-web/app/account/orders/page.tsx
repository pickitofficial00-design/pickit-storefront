
import Link from "next/link";
import { loadAccount } from "../../../lib/account";

export const instant = false;

export default async function OrdersPage() {
  const result = await loadAccount(false);

  if (result.status === "signed-out") {
    return <main style={{ padding: 40 }}>Please sign in to view your orders.</main>;
  }

  if (result.status === "error") {
    return <main style={{ padding: 40 }}>Unable to load your orders. Please try again later.</main>;
  }

  const orders = result.customer.orders.nodes;

  return (
    <main style={{ maxWidth: 850, margin: "40px auto", padding: 20 }}>
      <h1>My Orders</h1>

      {orders.length === 0 ? (
        <p>You haven't placed any orders yet.</p>
      ) : (
        orders.map((order) => (
          <section
            key={order.id}
            style={{
              border: "1px solid #ddd",
              borderRadius: 10,
              padding: 20,
              marginTop: 20,
            }}
          >
            <h2>{order.name}</h2>
            <p>Date: {new Date(order.processedAt).toLocaleDateString()}</p>
            <p>Payment: {order.financialStatus ?? "Unknown"}</p>
            <p>Fulfilment: {order.fulfillmentStatus ?? "Unknown"}</p>
            <p>
              Total:{" "}
              {new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: order.totalPrice.currencyCode,
              }).format(Number(order.totalPrice.amount))}
            </p>
          </section>
        ))
      )}

      <p style={{ marginTop: 30 }}>
        <Link href="/account">Back to My Account</Link>
      </p>
    </main>
  );
}
