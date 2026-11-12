
import { NextResponse } from "next/server";
import { createShopifyRequestContext } from "@shopify/hydrogen";

import {
  customerSession,
  createCustomerSessionManager,
} from "@/lib/customer-account";

import { env } from "@/lib/env";

export async function POST(request: Request) {
  const trustedOrigin = new URL(env.SITE_ORIGIN).origin;

  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");

  let requestOrigin = "";
  let refererOrigin = "";

  try {
    requestOrigin = origin
      ? new URL(origin).origin
      : referer
        ? new URL(referer).origin
        : "";

    refererOrigin = referer
      ? new URL(referer).origin
      : "";
  } catch {
    return new Response("Forbidden", { status: 403 });
  }

  const isDevelopment = process.env.NODE_ENV !== "production";

  const validOrigin =
    requestOrigin === trustedOrigin ||
    (
      isDevelopment &&
      requestOrigin === "http://localhost:3000" &&
      refererOrigin === trustedOrigin
    );

  if (!validOrigin) {
    return new Response("Forbidden", { status: 403 });
  }

  const requestContext = createShopifyRequestContext({
    request,
    i18n: {
      country: "US",
      language: "EN",
    },
  });

  const sessionManager =
    await createCustomerSessionManager(request);

  const logoutUrl = await customerSession.logout(
    sessionManager,
    requestContext,
    {
      postLogoutRedirectUri: new URL(
        "/account",
        env.SITE_ORIGIN
      ).toString(),
    }
  );

  const response = NextResponse.redirect(logoutUrl, 303);
  const committedHeaders = await sessionManager.commit?.();

  if (committedHeaders) {
    new Headers(committedHeaders).forEach((value, key) => {
      response.headers.append(key, value);
    });
  }

  return response;
}
