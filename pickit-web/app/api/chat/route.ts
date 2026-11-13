import { NextResponse } from "next/server";
import { gql } from "@shopify/hydrogen";
import { createRequestStorefrontClient } from "../../../lib/storefront";

const CHAT_PRODUCTS_QUERY = gql(`
  query PickitChatProducts {
    products(first: 25) {
      nodes {
        title
        handle
        description
        productType
        availableForSale
        priceRange {
          minVariantPrice {
            amount
            currencyCode
          }
        }
      }
    }
  }
`);

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export async function POST(request: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          reply:
            "PICKIT AI Assistant is almost ready! Please contact pickitofficial00@gmail.com for immediate help while we finish activating live AI chat.",
        },
        { status: 200 }
      );
    }

    const body = await request.json();
    const messages: ChatMessage[] = Array.isArray(body?.messages)
      ? body.messages.slice(-10)
      : [];

    const lastUserMessage = [...messages]
      .reverse()
      .find((m) => m.role === "user")?.content?.trim();

    if (!lastUserMessage) {
      return NextResponse.json(
        { error: "Message is required." },
        { status: 400 }
      );
    }

    let catalogSummary = "No products retrieved right now.";
    try {
      const storefront = createRequestStorefrontClient(request);
      const { data } = await storefront.graphql(CHAT_PRODUCTS_QUERY);
      const products = data?.products?.nodes ?? [];
      if (products.length > 0) {
        catalogSummary = products
          .map(
            (p: {
              title: string;
              handle: string;
              description: string;
              productType: string;
              availableForSale: boolean;
              priceRange?: {
                minVariantPrice?: { amount: string; currencyCode: string };
              };
            }) => {
              const price = p.priceRange?.minVariantPrice?.amount ?? "0.00";
              const currency =
                p.priceRange?.minVariantPrice?.currencyCode ?? "USD";
              const status = p.availableForSale ? "In stock" : "Out of stock";
              const desc = (p.description || "").slice(0, 140);
              return `- ${p.title} (${currency} $${price}, ${status}, Category: ${p.productType || "General"}) -> Link: /product/${p.handle} | Info: ${desc}`;
            }
          )
          .join("\n");
      }
    } catch {
      catalogSummary = "Live catalog temporarily unavailable.";
    }

    const systemInstruction = `You are PICKIT AI, the friendly, trustworthy shopping and customer support assistant for PICKIT (https://pickit-storefront.vercel.app), an online store specializing in trending gadgets, useful technology, and innovative everyday products.

STORE FACTS & POLICIES (use these strictly — never invent policies):
- Processing time: 1–3 business days after payment confirmation.
- Shipping time: United States standard tracked shipping takes 6–12 business days; international takes 8–18 business days.
- Returns & Exchanges: 30-day return & exchange window from delivery for unused items in original packaging. Damaged, defective, or wrong items reported within 7 days of delivery receive a free replacement or full refund.
- Order Tracking: Customers can sign in at /account/orders to view their orders, or email support with their order number.
- Customer Support Email: pickitofficial00@gmail.com (replies within 24 hours, Mon–Sat).
- Policy pages available on site: /policies/shipping, /policies/refund, /policies/privacy, /policies/terms, and /contact.

LIVE STORE CATALOG:
${catalogSummary}

RULES:
1. Keep responses concise, helpful, and natural (2–4 short sentences unless listing products).
2. When recommending a product from the catalog, include its exact relative link like /product/handle so the customer can click it.
3. Never invent products, prices, or discounts not listed in the catalog above.
4. For order-specific issues, ask for their order number and direct them to /account/orders or pickitofficial00@gmail.com.`;

    const contents = messages.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(
        apiKey
      )}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: systemInstruction }],
          },
          contents,
          generationConfig: {
            temperature: 0.5,
            maxOutputTokens: 450,
          },
        }),
      }
    );

    if (!geminiRes.ok) {
      return NextResponse.json({
        reply:
          "I'm having trouble connecting right now. You can browse products on our homepage or email pickitofficial00@gmail.com for quick help!",
      });
    }

    const geminiData = await geminiRes.json();
    const reply =
      geminiData?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
      "How can I help you with PICKIT products, shipping, or returns today?";

    return NextResponse.json({ reply });
  } catch {
    return NextResponse.json({
      reply:
        "Something went wrong. Please try again or email pickitofficial00@gmail.com.",
    });
  }
}
