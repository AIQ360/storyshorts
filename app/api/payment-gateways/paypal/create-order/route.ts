import { NextResponse } from "next/server";

// Sandbox: https://api-m.sandbox.paypal.com | Production: https://api-m.paypal.com
const PAYPAL_API =
  process.env.PAYPAL_API_URL || "https://api-m.sandbox.paypal.com";

async function getAccessToken(): Promise<string> {
  const res = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!res.ok) throw new Error("Failed to get PayPal access token");
  const data = await res.json();
  return data.access_token;
}

export async function POST(request: Request) {
  try {
    const { amount, credits, userId, planName } = await request.json();

    if (!amount || !credits || !userId || !planName) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const token = await getAccessToken();
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const res = await fetch(`${PAYPAL_API}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            amount: { currency_code: "USD", value: Number(amount).toFixed(2) },
            description: `Framecast AI ${planName} — ${credits} Credit${credits !== 1 ? "s" : ""}`,
            custom_id: JSON.stringify({ userId, credits }),
          },
        ],
        payment_source: {
          paypal: {
            experience_context: {
              return_url: `${baseUrl}/api/payment-gateways/paypal/capture-order`,
              cancel_url: `${baseUrl}/dashboard/billing`,
              brand_name: "Framecast AI",
              user_action: "PAY_NOW",
            },
          },
        },
      }),
    });

    const order = await res.json();

    if (!res.ok) {
      console.error("PayPal create order error:", order);
      return NextResponse.json(
        { error: "Failed to create PayPal order" },
        { status: 500 },
      );
    }

    const approvalUrl = order.links?.find(
      (l: { rel: string; href: string }) => l.rel === "payer-action",
    )?.href;

    if (!approvalUrl) {
      console.error("No approval URL in PayPal response:", order);
      return NextResponse.json(
        { error: "Failed to get PayPal approval URL" },
        { status: 500 },
      );
    }

    return NextResponse.json({ url: approvalUrl });
  } catch (error) {
    console.error("PayPal create order error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
