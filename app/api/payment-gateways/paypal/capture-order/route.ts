import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Sandbox: https://api-m.sandbox.paypal.com | Production: https://api-m.paypal.com
const PAYPAL_API =
  process.env.PAYPAL_API_URL || "https://api-m.sandbox.paypal.com";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!,
);

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

export async function GET(request: NextRequest) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const billingUrl = `${baseUrl}/dashboard/billing`;

  try {
    const orderId = request.nextUrl.searchParams.get("token");
    if (!orderId) {
      return NextResponse.redirect(`${billingUrl}?error=missing_order`);
    }

    const token = await getAccessToken();

    // Capture the payment
    const captureRes = await fetch(
      `${PAYPAL_API}/v2/checkout/orders/${encodeURIComponent(orderId)}/capture`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    const capture = await captureRes.json();

    if (capture.status !== "COMPLETED") {
      console.error("PayPal capture not completed:", capture);
      return NextResponse.redirect(`${billingUrl}?error=payment_failed`);
    }

    // Extract userId and credits from custom_id
    const customId =
      capture.purchase_units?.[0]?.payments?.captures?.[0]?.custom_id ||
      capture.purchase_units?.[0]?.custom_id;

    if (!customId) {
      console.error("No custom_id in PayPal capture:", capture);
      return NextResponse.redirect(`${billingUrl}?error=missing_data`);
    }

    const { userId, credits } = JSON.parse(customId) as {
      userId: string;
      credits: number;
    };

    // Update credits in database
    const { data: existing, error: selectError } = await supabase
      .from("credits")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (selectError && selectError.code !== "PGRST116") {
      throw selectError;
    }

    if (existing) {
      const { error: updateError } = await supabase
        .from("credits")
        .update({ credits: existing.credits + credits })
        .eq("user_id", userId);

      if (updateError) throw updateError;
    } else {
      const { error: insertError } = await supabase
        .from("credits")
        .insert({ user_id: userId, credits });

      if (insertError) throw insertError;
    }

    const captureAmount =
      capture.purchase_units?.[0]?.payments?.captures?.[0]?.amount;
    const amountValue = captureAmount?.value;
    const amountCurrency = captureAmount?.currency_code || "USD";

    if (amountValue) {
      const { error: paymentError } = await supabase.from("payments").insert({
        user_id: userId,
        amount: parseFloat(amountValue),
        currency: amountCurrency.toLowerCase(),
      });

      if (paymentError) {
        console.error("Failed to insert PayPal payment record:", paymentError);
      }
    }

    console.log(
      `✅ PayPal: Added ${credits} credits for user ${userId} (order: ${orderId})`,
    );

    return NextResponse.redirect(`${billingUrl}?success=paypal`);
  } catch (error) {
    console.error("PayPal capture error:", error);
    return NextResponse.redirect(`${billingUrl}?error=capture_failed`);
  }
}
