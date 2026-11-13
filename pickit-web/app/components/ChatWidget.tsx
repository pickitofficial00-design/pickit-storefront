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
  const cleaned = text.replace(/\*\*/g, "");
  const parts = cleaned.split(
    /(\/(?:product\/[a-zA-Z0-9-_]+|policies\/[a-zA-Z0-9-_]+|account\/orders|contact|cart))/g
  );
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
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({ messages: updated }),
      });
      clearTimeout(timer);

      const data = await res.json();
      setMessages([
        ...updated,
        {
          role: "assistant",
          content: data.reply || "How can I help you with PICKIT today?",
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
        bottom: 22,
        right: 22,
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
            borderRadius: 18,
            boxShadow: "0 18px 44px rgba(0,0,0,0.22)",
            border: "1px solid #e5e5e5",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            marginBottom: 14,
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
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #f26b21, #ff8c42)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 900,
                  fontSize: 12,
                  color: "#fff",
                }}
              >
                AI
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 14 }}>AI Assistant</div>
                <div style={{ fontSize: 11, color: "#4ade80" }}>
                  ● Online
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close AI chat"
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
                  borderRadius: 14,
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
              placeholder="Ask AI anything..."
              style={{
                flex: 1,
                border: "1px solid #ddd",
                borderRadius: 10,
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
                borderRadius: 10,
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
        aria-label={open ? "Close AI" : "Open AI"}
        style={{
          width: 58,
          height: 58,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #171717 0%, #2b2b2b 100%)",
          color: "#ffffff",
          border: "2px solid #f26b21",
          boxShadow: "0 10px 28px rgba(0, 0, 0, 0.28)",
          cursor: "pointer",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          marginLeft: "auto",
          position: "relative",
        }}
      >
        {open ? (
          <span style={{ fontSize: 18, fontWeight: 700, lineHeight: 1 }}>✕</span>
        ) : (
          <>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#f26b21"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 3l1.9 5.8L20 11l-6.1 2.2L12 19l-1.9-5.8L4 11l6.1-2.2L12 3z" />
            </svg>
            <span
              style={{
                fontSize: 10,
                fontWeight: 900,
                letterSpacing: 0.8,
                color: "#ffffff",
                marginTop: 1,
                lineHeight: 1,
              }}
            >
              AI
            </span>
          </>
        )}
      </button>
    </div>
  );
}
