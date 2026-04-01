import Razorpay from "razorpay";
import { NextRequest, NextResponse } from "next/server";

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export async function POST(request: NextRequest) {
  try {
    const { amount, currency, credits, userId } = (await request.json()) as {
      amount: number;
      currency: string;
      credits: number;
      userId: string;
    };

    if (!amount || !currency || !credits || !userId) {
      return NextResponse.json(
        { error: "amount, currency, credits, and userId are required" },
        { status: 400 },
      );
    }

    const amountInSmallestUnit = Math.round(amount * 100);

    if (amountInSmallestUnit < 100) {
      return NextResponse.json(
        { error: "Amount must be at least 1 USD" },
        { status: 400 },
      );
    }

    const order = await razorpay.orders.create({
      amount: amountInSmallestUnit,
      currency,
      receipt: `rcpt_${Date.now()}`,
      notes: {
        credits: String(credits),
        userId,
      },
    });

    return NextResponse.json({ orderId: order.id }, { status: 200 });
  } catch (error) {
    console.error("Razorpay order creation error:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 },
    );
  }
}
