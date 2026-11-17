import { gql } from "@shopify/hydrogen";
import { createRequestStorefrontClient } from "../../../lib/storefront";

function normalizeUsPhone(raw?: string): string | undefined {
  if (!raw) return undefined;
  const digits = raw.replace(/\D/g, "");
  if (!digits) return undefined;
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  if (raw.trim().startsWith("+") && digits.length >= 10) return `+${digits}`;
  return undefined;
}

const CUSTOMER_CREATE_MUTATION = gql(`
  mutation CustomerCreate($input: CustomerCreateInput!) {
    customerCreate(input: $input) {
      customer {
        id
        firstName
        lastName
        email
        phone
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
      phone
    }
  }
`);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, loginMethod, email, phone, password, firstName, lastName } = body || {};

    const cleanEmail = (email || "").trim();
    const normalizedPhone = normalizeUsPhone(phone);

    if (action === "recover") {
      if (!cleanEmail) {
        return Response.json({ error: "Please enter your email address." }, { status: 400 });
      }
      const storefront = createRequestStorefrontClient(request);
      const { data: recData, errors: recErrors } = await storefront.graphql(
        CUSTOMER_RECOVER_MUTATION,
        { variables: { email: cleanEmail } }
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
      return Response.json({ error: "Please enter your password." }, { status: 400 });
    }

    const storefront = createRequestStorefrontClient(request);

    if (action === "signup") {
      if (!cleanEmail) {
        return Response.json({ error: "Please enter your email address." }, { status: 400 });
      }
      if (phone && phone.trim() && !normalizedPhone) {
        return Response.json(
          { error: "Please enter a valid 10-digit US phone number (e.g. 555-123-4567)." },
          { status: 400 }
        );
      }

      const { data: createData, errors: createErrors } = await storefront.graphql(
        CUSTOMER_CREATE_MUTATION,
        {
          variables: {
            input: {
              email: cleanEmail,
              password,
              firstName: (firstName || "").trim() || undefined,
              lastName: (lastName || "").trim() || undefined,
              phone: normalizedPhone,
              acceptsMarketing: true,
            },
          },
        }
      );

      const userErrors = createData?.customerCreate?.customerUserErrors || [];
      if (createErrors || userErrors.length > 0) {
        return Response.json(
          { error: userErrors[0]?.message || "Unable to create account. Try a different email or phone." },
          { status: 400 }
        );
      }
    }

    // Resolve email for Shopify Storefront login (supports Email OR Phone sign-in)
    let loginEmail = cleanEmail;
    if (action === "login" && loginMethod === "phone") {
      if (!normalizedPhone) {
        return Response.json(
          { error: "Please enter a valid 10-digit US phone number." },
          { status: 400 }
        );
      }
      if (!loginEmail) {
        return Response.json(
          { error: "Please also enter your account email to verify phone sign-in." },
          { status: 400 }
        );
      }
    }

    if (!loginEmail) {
      return Response.json({ error: "Please enter your email address." }, { status: 400 });
    }

    const { data: loginData, errors: loginErrors } = await storefront.graphql(
      CUSTOMER_LOGIN_MUTATION,
      {
        variables: {
          input: { email: loginEmail, password },
        },
      }
    );

    const loginUserErrors = loginData?.customerAccessTokenCreate?.customerUserErrors || [];
    const tokenObj = loginData?.customerAccessTokenCreate?.customerAccessToken;

    if (loginErrors || loginUserErrors.length > 0 || !tokenObj?.accessToken) {
      return Response.json(
        { error: loginUserErrors[0]?.message || "Invalid credentials. Please check and try again." },
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
        email: customer?.email || loginEmail,
        phone: customer?.phone || normalizedPhone || "",
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
