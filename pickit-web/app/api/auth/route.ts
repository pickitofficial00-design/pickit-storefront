import { gql } from "@shopify/hydrogen";
import { createRequestStorefrontClient } from "../../../lib/storefront";

const CUSTOMER_CREATE_MUTATION = gql(`
  mutation CustomerCreate($input: CustomerCreateInput!) {
    customerCreate(input: $input) {
      customer {
        id
        firstName
        lastName
        email
      }
      customerUserErrors {
        field
        message
      }
    }
  }
`);

const CUSTOMER_LOGIN_MUTATION = gql(`
  mutation CustomerAccessTokenCreate($input: CustomerAccessTokenCreateInput!) {
    customerAccessTokenCreate(input: $input) {
      customerAccessToken {
        accessToken
        expiresAt
      }
      customerUserErrors {
        field
        message
      }
    }
  }
`);

const CUSTOMER_RECOVER_MUTATION = gql(`
  mutation CustomerRecover($email: String!) {
    customerRecover(email: $email) {
      customerUserErrors {
        field
        message
      }
    }
  }
`);

const CUSTOMER_INFO_QUERY = gql(`
  query CustomerInfo($token: String!) {
    customer(customerAccessToken: $token) {
      id
      firstName
      lastName
      email
    }
  }
`);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, email, password, firstName, lastName } = body || {};

    if (!email || !email.trim()) {
      return Response.json({ error: "Please enter your email address." }, { status: 400 });
    }

    const storefront = createRequestStorefrontClient(request);

    if (action === "recover") {
      const { data: recData, errors: recErrors } = await storefront.graphql(
        CUSTOMER_RECOVER_MUTATION,
        { variables: { email: email.trim() } }
      );
      const userErrors = recData?.customerRecover?.customerUserErrors || [];
      if (recErrors || userErrors.length > 0) {
        return Response.json(
          { error: userErrors[0]?.message || "Could not send password reset email." },
          { status: 400 }
        );
      }
      return Response.json({
        ok: true,
        message: "Password reset link sent! Check your email inbox.",
      });
    }

    if (!password) {
      return Response.json({ error: "Please enter both email and password." }, { status: 400 });
    }

    if (action === "signup") {
      const { data: createData, errors: createErrors } = await storefront.graphql(
        CUSTOMER_CREATE_MUTATION,
        {
          variables: {
            input: {
              email: email.trim(),
              password,
              firstName: (firstName || "").trim() || undefined,
              lastName: (lastName || "").trim() || undefined,
              acceptsMarketing: true,
            },
          },
        }
      );

      const userErrors = createData?.customerCreate?.customerUserErrors || [];
      if (createErrors || userErrors.length > 0) {
        return Response.json(
          { error: userErrors[0]?.message || "Unable to create account. Try a different email." },
          { status: 400 }
        );
      }
    }

    const { data: loginData, errors: loginErrors } = await storefront.graphql(
      CUSTOMER_LOGIN_MUTATION,
      {
        variables: {
          input: { email: email.trim(), password },
        },
      }
    );

    const loginUserErrors = loginData?.customerAccessTokenCreate?.customerUserErrors || [];
    const tokenObj = loginData?.customerAccessTokenCreate?.customerAccessToken;

    if (loginErrors || loginUserErrors.length > 0 || !tokenObj?.accessToken) {
      return Response.json(
        { error: loginUserErrors[0]?.message || "Invalid email or password." },
        { status: 401 }
      );
    }

    const { data: infoData } = await storefront.graphql(CUSTOMER_INFO_QUERY, {
      variables: { token: tokenObj.accessToken },
    });

    const customer = infoData?.customer;
    return Response.json({
      accessToken: tokenObj.accessToken,
      expiresAt: tokenObj.expiresAt,
      customer: {
        id: customer?.id || "",
        firstName: customer?.firstName || firstName || "",
        lastName: customer?.lastName || lastName || "",
        email: customer?.email || email.trim(),
      },
    });
  } catch (err: any) {
    console.error("Auth API error:", err);
    return Response.json(
      { error: err?.message || "Authentication error. Please try again." },
      { status: 500 }
    );
  }
}
