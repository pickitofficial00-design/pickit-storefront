
import {
  createShopifyRequestContext,
  createStorefrontClient,
} from "@shopify/hydrogen";

import { env } from "./env";

export function createRequestStorefrontClient(
  request: Pick<Request, "headers">
) {
  const requestContext = createShopifyRequestContext({
    request,
    i18n: {
      country: "US",
      language: "EN",
    },
  });

  return createStorefrontClient({
    type: "private_no_buyer_context",
    requestContext,
    config: {
      storeDomain: "h1fecw-jq.myshopify.com",
      privateStorefrontToken:
        env.PRIVATE_STOREFRONT_API_TOKEN,
    },
  });
}
