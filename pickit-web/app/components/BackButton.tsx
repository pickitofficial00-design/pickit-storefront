"use client";

import { usePathname, useRouter } from "next/navigation";

export default function BackButton() {
  const pathname = usePathname();
  const router = useRouter();

  // Hide on the homepage
  if (!pathname || pathname === "/") return null;

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  };

  return (
    <div
      style={{
        position: "sticky",
        top: "12px",
        left: "16px",
        zIndex: 50,
        display: "inline-flex",
        margin: "12px 0 0 16px",
      }}
    >
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
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
          fontSize: "13px",
          fontWeight: 700,
          cursor: "pointer",
        }}
      >
        <span style={{ fontSize: "16px", lineHeight: 1 }}>←</span> Back
      </button>
    </div>
  );
}