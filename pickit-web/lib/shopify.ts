
import {
  handleShopifyRoutes,
  type StorefrontClient,
} from "@shopify/hydrogen";

import { createCustomerAccountServerHandlers } from "@shopify/hydrogen/customer-account";

import {
  createCustomerSessionManager,
  customerSession,
} from "./customer-account";

import { routeTemplates } from "./route-templates";
import { createRequestStorefrontClient } from "./storefront";

const customerAccountHandlers =
  createCustomerAccountServerHandlers({
    customerSession,
    defaultPostLoginRedirectPathname: "/account",
    postLogoutRedirectUri: "/",
  });

export async function handleRequest(
  request: Request,
  next: (
    request: Request,
    storefrontClient: StorefrontClient
  ) => Promise<Response>
): Promise<Response> {
  const storefrontClient =
    createRequestStorefrontClient(request);

  const { requestContext } = storefrontClient;

  const sessionManager =
    await createCustomerSessionManager(request);

 const pathname = new URL(request.url).pathname;

const shopifyResponse =
  pathname === "/account/logout"
    ? null
    : await handleShopifyRoutes({
        request,
        requestContext,
        sessionManager,
        storefrontClient,
        routeTemplates,
        handlers: [customerAccountHandlers],
      });

  if (shopifyResponse) {
  return shopifyResponse;
}


  let response = await next(request, storefrontClient);

  response = new Response(response.body, response);

  const sessionHeaders = new Headers(
    (await sessionManager.commit?.()) ?? undefined
  );

  for (const [name, value] of sessionHeaders) {
    response.headers.append(name, value);
  }

  requestContext.applyResponseHeaders(response.headers);

  return response;
}
