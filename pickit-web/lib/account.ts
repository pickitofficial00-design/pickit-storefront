
import { createShopifyRequestContext } from "@shopify/hydrogen";
import { gql } from "@shopify/hydrogen/customer-account";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import {
  createCustomerSessionManager,
  createRequestCustomerAccountClient,
  customerSession,
} from "./customer-account";

import { env } from "./env";

const CUSTOMER_QUERY = gql(`
  query CurrentCustomer {
    customer {
      firstName
      lastName
      emailAddress {
        emailAddress
      }
      orders(first: 10, sortKey: PROCESSED_AT, reverse: true) {
        nodes {
          id
          name
          processedAt
          financialStatus
          fulfillmentStatus
          totalPrice {
            amount
            currencyCode
          }
        }
      }
    }
  }
`);

export async function loadAccount(refreshAttempted: boolean) {
  const request = new Request(
    new URL("/account", env.SITE_ORIGIN),
    {
      headers: await headers(),
    }
  );

  const requestContext = createShopifyRequestContext({
    request,
    i18n: {
      country: "US",
      language: "EN",
    },
  });

  const sessionManager =
    await createCustomerSessionManager(request);

  const accessToken = await customerSession.getAccessToken(
    sessionManager,
    requestContext
  );

  if (!accessToken && !refreshAttempted) {
    redirect(
      `/account/refresh?return_to=${encodeURIComponent(
        "/account?refreshed=1"
      )}`
    );
  }

  if (!accessToken) {
    return { status: "signed-out" } as const;
  }

  const client =
    createRequestCustomerAccountClient(requestContext);

  const { data, errors } = await client.graphql(
    CUSTOMER_QUERY,
    { accessToken }
  );

  if (errors || !data.customer) {
    return { status: "error" } as const;
  }

  return {
    status: "signed-in",
    customer: data.customer,
  } as const;
}
