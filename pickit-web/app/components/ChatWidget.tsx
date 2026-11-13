"use client";

import { useState } from "react";
import Link from "next/link";

type Message = {
  role: "user" | "assistant";
  content: string;
};

const QUICK_PROMPTS = [
  "What products are available?",
  "How long does US shipping take?",
  "What is your return policy?",
];

function renderMessageWithLinks(text: string) {
  const parts = text.split(/(\/(?:product\/[a-zA-Z0-9-_]+|policies\/[a-zA-Z0-9-_]+|account\/orders|contact|cart))/g);
  return parts.map((part, idx) => {
    if (part.startsWith("/")) {
      return (
        <Link
          key={idx}
          href={part}
          style={{
            color: "#f26b21",
            fontWeight: 700,
            textDecoration: "underline",
          }}
        >
          {part}
        </Link>
      );
    }
    return <span key={idx}>{part}</span>;
  });
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hi! Welcome to PICKIT 👋 Ask me about our products, shipping times, or returns.",
    },
  ]);

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const updated: Message[] = [...messages, { role: "user", content: trimmed }];
    setMessages(updated);
    setInput("");
    setLoading(true);

    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 12000);
      const res = await fetch("/api/chat", {
        signal: controller.signal,
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updated }),
      });

      clearTimeout(timer);
      const data = await res.json();
      setMessages([
        ...updated,
        {
          role: "assistant",
          content:
            data.reply ||
            "How can I help you with PICKIT today?",
        },
      ]);
    } catch {
      setMessages([
        ...updated,
        {
          role: "assistant",
          content:
            "Connection issue — please try again or email pickitofficial00@gmail.com.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        position: "fixed",
        bottom: 20,
        right: 20,
        zIndex: 9999,
        fontFamily: "Arial, sans-serif",
      }}
    >
      {open && (
        <div
          style={{
            width: 340,
            maxWidth: "calc(100vw - 32px)",
            height: 460,
            background: "#ffffff",
            borderRadius: 16,
            boxShadow: "0 16px 40px rgba(0,0,0,0.2)",
            border: "1px solid #e5e5e5",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            marginBottom: 12,
          }}
        >
          <div
            style={{
              background: "#171717",
              color: "#ffffff",
              padding: "14px 16px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <div style={{ fontWeight: 900, fontSize: 15 }}>
                PICK<span style={{ color: "#f26b21" }}>IT</span> Assistant
              </div>
              <div style={{ fontSize: 11, color: "#bbb" }}>
                ● Online — Instant Product &amp; Order Help
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close chat"
              style={{
                background: "transparent",
                border: "none",
                color: "#fff",
                fontSize: 18,
                cursor: "pointer",
              }}
            >
              ✕
            </button>
          </div>

          <div
            style={{
              flex: 1,
              padding: 14,
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: 10,
              background: "#faf9f7",
            }}
          >
            {messages.map((m, idx) => (
              <div
                key={idx}
                style={{
                  alignSelf: m.role === "user" ? "flex-end" : "flex-start",
                  background: m.role === "user" ? "#f26b21" : "#ffffff",
                  color: m.role === "user" ? "#ffffff" : "#171717",
                  border: m.role === "user" ? "none" : "1px solid #e8e8e8",
                  padding: "10px 13px",
                  borderRadius: 12,
                  fontSize: 13,
                  lineHeight: 1.5,
                  maxWidth: "85%",
                  whiteSpace: "pre-wrap",
                }}
              >
                {m.role === "assistant"
                  ? renderMessageWithLinks(m.content)
                  : m.content}
              </div>
            ))}

            {loading && (
              <div
                style={{
                  alignSelf: "flex-start",
                  background: "#ffffff",
                  border: "1px solid #e8e8e8",
                  padding: "8px 12px",
                  borderRadius: 12,
                  fontSize: 12,
                  color: "#777",
                }}
              >
                Typing...
              </div>
            )}

            {messages.length === 1 && !loading && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 4 }}>
                {QUICK_PROMPTS.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => sendMessage(q)}
                    style={{
                      background: "#ffffff",
                      border: "1px solid #ddd",
                      borderRadius: 999,
                      padding: "6px 10px",
                      fontSize: 11,
                      cursor: "pointer",
                      color: "#171717",
                    }}
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage(input);
            }}
            style={{
              display: "flex",
              borderTop: "1px solid #eeeeee",
              padding: 10,
              background: "#ffffff",
              gap: 8,
            }}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about products, shipping..."
              style={{
                flex: 1,
                border: "1px solid #ddd",
                borderRadius: 8,
                padding: "9px 12px",
                fontSize: 13,
                outline: "none",
              }}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              style={{
                background: "#171717",
                color: "#ffffff",
                border: "none",
                borderRadius: 8,
                padding: "0 14px",
                fontWeight: 700,
                fontSize: 13,
                cursor: "pointer",
              }}
            >
              Send
            </button>
          </form>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        style={{
          background: "#f26b21",
          color: "#ffffff",
          border: "none",
          borderRadius: 999,
          padding: "13px 18px",
          fontWeight: 800,
          fontSize: 14,
          boxShadow: "0 8px 24px rgba(242,107,33,0.4)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginLeft: "auto",
        }}
      >
        💬 {open ? "Close" : "Ask PICKIT AI"}
      </button>
    </div>
  );
}
