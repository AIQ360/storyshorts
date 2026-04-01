import { Database } from "@/types/supabase";
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-02-25.clover",
});

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY!;

const supabase = createClient<Database>(supabaseUrl, supabaseSecretKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false,
  },
});

async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session,
) {
  try {
    if (!session.client_reference_id) {
      console.log("⚠️ No client_reference_id found in session");
      return true;
    }

    // Read credits from session metadata (set during checkout creation)
    const credits = Number(session.metadata?.credits);
    if (!credits || credits <= 0) {
      console.log("⚠️ No valid credits in session metadata:", session.metadata);
      return false;
    }

    const userId = session.client_reference_id;
    console.log(`📦 Processing ${credits} credits for user ${userId}`);

    const { data: existingCredits, error: selectError } = await supabase
      .from("credits")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (selectError && selectError.code !== "PGRST116") {
      console.error("Error fetching existing credits:", selectError);
      return false;
    }

    if (existingCredits) {
      const { error: updateError } = await supabase
        .from("credits")
        .update({ credits: existingCredits.credits + credits })
        .eq("user_id", userId);

      if (updateError) {
        console.error("Error updating credits:", updateError);
        return false;
      }
    } else {
      const { error: insertError } = await supabase
        .from("credits")
        .insert({ user_id: userId, credits });

      if (insertError) {
        console.error("Error inserting credits:", insertError);
        return false;
      }
    }

    const amountTotal = session.amount_total ?? 0;
    const currency = session.currency || "usd";
    if (amountTotal > 0) {
      const { error: paymentError } = await supabase.from("payments").insert({
        user_id: userId,
        amount: amountTotal / 100,
        currency,
      });

      if (paymentError) {
        console.error("Error inserting payment record:", paymentError);
      }
    }

    console.log(`✅ Successfully added ${credits} credits for user ${userId}`);
    return true;
  } catch (error) {
    console.error("Error processing checkout session:", error);
    return false;
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const signature = (await headers()).get("stripe-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "No signature provided" },
        { status: 400 },
      );
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!,
      );
    } catch (err) {
      console.error(`⚠️ Webhook signature verification failed:`, err);
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    console.log(`📨 Received event: ${event.type}`);

    switch (event.type) {
      case "checkout.session.completed":
        const success = await handleCheckoutSessionCompleted(
          event.data.object as Stripe.Checkout.Session,
        );
        if (!success) {
          return NextResponse.json(
            { error: "Failed to process checkout session" },
            { status: 500 },
          );
        }
        break;

      case "charge.succeeded":
      case "payment_intent.succeeded":
      case "payment_intent.created":
      case "charge.updated":
      case "product.created":
      case "price.created":
        console.log(`ℹ️ Acknowledged event ${event.type}`);
        break;

      default:
        console.log(`⚠️ Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 },
    );
  }
}
