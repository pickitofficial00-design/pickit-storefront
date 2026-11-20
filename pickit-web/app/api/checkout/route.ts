import { gql } from "@shopify/hydrogen";
import { createRequestStorefrontClient } from "../../../lib/storefront";

const CART_CREATE_MUTATION = gql(`
  mutation PickitCartCreate($lines: [CartLineInput!]!) {
    cartCreate(input: { lines: $lines }) {
      cart {
        id
        checkoutUrl
      }
      userErrors {
        field
        message
      }
    }
  }
`);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const items: { variantId: string; quantity: number }[] = body.items || [];

    if (!items.length) {
      return Response.json({ error: "Cart is empty" }, { status: 400 });
    }

    const jitBase = ((process.env.PICKIT_API_URL || "").match(/https?:\/\/[^)\]\s"']+/)?.[0]) || "https://api.pickitcart.com";
    const lines = [];
    for (const item of items) {
      let vid = item.variantId;
      if (String(vid).startsWith("jit::")) {
        const pid = String(vid).replace(/^jit::/, "");
        const jr = await fetch(jitBase + "/api/jit-cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId: pid })
        });
        const jd = await jr.json();
        vid = jd?.item?.shopify_variant_id;
        if (!vid || String(vid).includes("DRY_")) {
          return Response.json({ error: jd?.error || "Failed to sync JIT product" }, { status: 502 });
        }
      }
      lines.push({ merchandiseId: vid, quantity: item.quantity });
    }

    const storefront = createRequestStorefrontClient(request);
    const { data, errors } = await storefront.graphql(CART_CREATE_MUTATION, {
      variables: { lines },
    });

    if (errors || data?.cartCreate?.userErrors?.length) {
      console.error("Shopify checkout error:", errors || data?.cartCreate?.userErrors);
      return Response.json({ error: "Failed to create checkout" }, { status: 502 });
    }

    return Response.json({
      checkoutUrl: data?.cartCreate?.cart?.checkoutUrl,
    });
  } catch (error) {
    console.error("Checkout API error:", error);
    return Response.json({ error: "Server error creating checkout" }, { status: 500 });
  }
}
