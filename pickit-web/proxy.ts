
import { NextResponse, type NextRequest } from "next/server";
import { handleRequest } from "./lib/shopify";

export async function proxy(request: NextRequest) {
  return handleRequest(request, async (_request, storefrontClient) =>
    NextResponse.next({
      request: {
        headers:
          storefrontClient.requestContext.getForwardedRequestHeaders(),
      },
    })
  );
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|_next/data|favicon.ico).*)",
  ],
};
