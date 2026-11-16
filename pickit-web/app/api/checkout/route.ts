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

    const lines = items.map((item) => ({
      merchandiseId: item.variantId,
      quantity: item.quantity,
    }));

    const storefront = createRequestStorefrontClient(request);
    const { data, errors } = await storefront.graphql(CART_CREATE_MUTATION, {
      variables: { lines },
    });

    if (errors || data?.cartCreate?.userErrors?.length) {
      console.error("Shopify checkout error:", errors || data?.cartCreate?.userErrors);
      return Response.json({ error: "Failed to create checkout" }, { status: 502 });
    }

    return Response.json({
      checkoutUrl: data.cartCreate.cart.checkoutUrl,
    });
  } catch (error) {
    console.error("Checkout API error:", error);
    return Response.json({ error: "Server error creating checkout" }, { status: 500 });
  }
}
