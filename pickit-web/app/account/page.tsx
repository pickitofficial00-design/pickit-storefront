
import { connection } from "next/server";
import Link from "next/link";
import { loadAccount } from "../../lib/account";

export const instant = false;

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ refreshed?: string }>;
}) {
  // Force request-time rendering instead of prerendering.
  await connection();

  const params = await searchParams;
  const result = await loadAccount(params.refreshed === "1");

  if (result.status === "signed-out") {
    return (
      <main style={{ padding: 40, textAlign: "center" }}>
        <h1>Welcome to PICKIT</h1>
        <p>Please sign in to view your account.</p>
        <a href="/account/login">Sign In</a>
      </main>
    );
  }

  if (result.status === "error") {
    return (
      <main style={{ padding: 40 }}>
        <h1>Unable to load your account</h1>
        <p>Please try again later.</p>
      </main>
    );
  }

  const { customer } = result;

  return (
    <main style={{ maxWidth: 700, margin: "40px auto", padding: 20 }}>
      <h1>My PICKIT Account</h1>

      <section style={{ marginTop: 30 }}>
        <h2>Profile</h2>
        <p>
          Name: {customer.firstName} {customer.lastName}
        </p>
        <p>
          Email: {customer.emailAddress?.emailAddress ?? "No email available"}
        </p>
      </section>

      <section style={{ marginTop: 30 }}>
        <h2>Orders</h2>
        <a href="/account/orders">View My Orders</a>
      </section>

      <form action="/account/logout" method="POST" style={{ marginTop: 30 }}>
        <button
          type="submit"
          style={{
            padding: "12px 24px",
            background: "#171717",
            color: "white",
            border: 0,
            borderRadius: 8,
            cursor: "pointer",
          }}
        >
          Sign Out
        </button>
      </form>

      <p style={{ marginTop: 30 }}>
        <Link href="/">Continue Shopping</Link>
      </p>
    </main>
  );
}
