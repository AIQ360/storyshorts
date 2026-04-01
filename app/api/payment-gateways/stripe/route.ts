export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  try {
    const { amount, credits, planName, userId } = await req.json();

    if (!amount || !credits || !planName || !userId) {
      return NextResponse.json(
        { error: "amount, credits, planName, and userId are required" },
        { status: 400 },
      );
    }

    const stripeSession = await stripe.checkout.sessions.create({
      success_url: `${baseUrl}/dashboard/billing?success=stripe`,
      cancel_url: `${baseUrl}/dashboard/billing`,
      payment_method_types: ["card"],
      mode: "payment",
      billing_address_collection: "auto",
      client_reference_id: userId,
      metadata: {
        credits: String(credits),
        plan_name: planName,
      },
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: Math.round(amount * 100),
            product_data: {
              name: `Framecast AI — ${planName} Plan`,
              description: `${credits} credit${credits !== 1 ? "s" : ""} for AI headshot generation. Each credit includes one model training session with 16+ professional headshots across multiple backgrounds and outfits.`,
            },
          },
          quantity: 1,
        },
      ],
    });

    return NextResponse.json({ url: stripeSession.url });
  } catch (error) {
    console.error("[STRIPE_ERROR]", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
