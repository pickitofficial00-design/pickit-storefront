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

type IncomingCartItem = {
  id?: string;
  variantId?: string;
  quantity?: number;
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const items: IncomingCartItem[] = Array.isArray(body?.items)
      ? body.items
      : [];

    const lines = items
      .map((item) => {
        const merchandiseId = item.variantId || item.id;
        const quantity = Number(item.quantity ?? 0);

        if (
          typeof merchandiseId !== "string" ||
          !merchandiseId.startsWith("gid://shopify/ProductVariant/") ||
          !Number.isInteger(quantity) ||
          quantity < 1
        ) {
          return null;
        }

        return {
          merchandiseId,
          quantity,
        };
      })
      .filter((line): line is { merchandiseId: string; quantity: number } =>
        Boolean(line)
      );

    if (lines.length === 0) {
      return Response.json(
        { error: "No valid Shopify product variants in cart." },
        { status: 400 }
      );
    }

    const storefront = createRequestStorefrontClient(request);

    const { data, errors } = await storefront.graphql(CART_CREATE_MUTATION, {
      variables: {
        lines,
      },
    });

    if (errors) {
      console.error("Shopify cartCreate GraphQL errors:", errors);

      return Response.json(
        { error: "Failed to create Shopify checkout." },
        { status: 502 }
      );
    }

    const userErrors = data?.cartCreate?.userErrors ?? [];

    if (userErrors.length > 0) {
      return Response.json(
        { error: userErrors[0]?.message || "Unable to proceed to checkout." },
        { status: 400 }
      );
    }

    const checkoutUrl = data?.cartCreate?.cart?.checkoutUrl;

    if (!checkoutUrl) {
      return Response.json(
        { error: "Shopify did not return a checkout URL." },
        { status: 502 }
      );
    }

    return Response.json({ checkoutUrl });
  } catch (error) {
    console.error("Checkout API error:", error);

    return Response.json(
      { error: "Something went wrong while starting checkout." },
      { status: 500 }
    );
  }
}
