import type { ShopifyRequestContext } from "@shopify/hydrogen";

import {
  createCustomerAccountClient,
  createCustomerSession,
} from "@shopify/hydrogen/customer-account";

import { env } from "./env";
import { createRequestSessionManager } from "./session";

export const customerSession = createCustomerSession({
  shopId: env.SHOP_ID,
  customerAccountApiClientId:
    env.PUBLIC_CUSTOMER_ACCOUNT_API_CLIENT_ID,
});

export function createCustomerSessionManager(request: Request) {
  return createRequestSessionManager(
    request,
    env.SESSION_SECRET
  );
}

export function createRequestCustomerAccountClient(
  requestContext: ShopifyRequestContext
) {
  return createCustomerAccountClient({
    shopId: env.SHOP_ID,
    requestContext,
  });
}