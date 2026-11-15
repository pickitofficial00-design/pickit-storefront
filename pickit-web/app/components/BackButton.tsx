"use client";

import { usePathname, useRouter } from "next/navigation";

export default function BackButton() {
  const pathname = usePathname();
  const router = useRouter();

  if (!pathname || pathname === "/" || pathname === "/cart") return null;

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  };

  return (
    <div style={{ backgroundColor: "#faf9f7", padding: "12px 16px 0" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <button
          type="button"
          onClick={handleBack}
          aria-label="Go back"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            padding: "8px 16px",
            borderRadius: "999px",
            backgroundColor: "#ffffff",
            color: "#141414",
            border: "1px solid #e5e3de",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
            fontSize: "13px",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          <span style={{ fontSize: "16px", lineHeight: 1 }}>←</span> Back
        </button>
      </div>
    </div>
  );
}