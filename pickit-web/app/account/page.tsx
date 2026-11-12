"use client";
import Link from "next/link";

export default function AccountPage() {
  return (
    <main className="account-page">
      <div className="account-box">
        <Link href="/" className="account-logo">
          PICKIT
        </Link>

        <h1>Welcome to PICKIT</h1>
        <p>Sign in or create your customer account securely.</p>

        <a
          className="account-button"
          href="https://shopify.com/79535210718/account"
        >
          Continue to Account
        </a>

        <Link href="/" className="back-home">
          ← Back to Home
        </Link>
      </div>

      <style jsx>{`
        .account-page {
          min-height: 80vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 30px 16px;
          background: #f5f5f5;
        }

        .account-box {
          width: 100%;
          max-width: 420px;
          background: white;
          padding: 35px;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.07);
        }

        .account-logo {
          display: block;
          text-align: center;
          color: #f36b21;
          font-size: 30px;
          font-weight: 900;
          text-decoration: none;
          margin-bottom: 25px;
        }

        h1 {
          text-align: center;
          color: #222;
        }

        p {
          text-align: center;
          color: #777;
          margin-bottom: 25px;
        }

        .account-button {
          display: block;
          padding: 14px;
          background: #f36b21;
          color: white;
          text-align: center;
          text-decoration: none;
          border-radius: 7px;
          font-weight: bold;
        }

        .back-home {
          display: block;
          text-align: center;
          margin-top: 25px;
          color: #555;
          text-decoration: none;
        }
      `}</style>
    </main>
  );
}
