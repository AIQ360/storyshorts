import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY!;
const supabase = createClient(supabaseUrl, supabaseSecretKey);

function verifySignature(
  razorpayOrderId: string,
  razorpayPaymentId: string,
  razorpaySignature: string,
): boolean {
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) {
    throw new Error("Razorpay key secret is not defined");
  }

  const expectedSignature = crypto
    .createHmac("sha256", keySecret)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(expectedSignature),
    Buffer.from(razorpaySignature),
  );
}

export async function POST(request: NextRequest) {
  try {
    const {
      orderCreationId,
      razorpayPaymentId,
      razorpaySignature,
      userId,
      credits,
      amount,
      currency,
    } = (await request.json()) as {
      orderCreationId: string;
      razorpayPaymentId: string;
      razorpaySignature: string;
      userId: string;
      credits: number;
      amount: number;
      currency: string;
    };

    if (
      !orderCreationId ||
      !razorpayPaymentId ||
      !razorpaySignature ||
      !userId ||
      !credits ||
      !amount
    ) {
      return NextResponse.json(
        { message: "Missing required fields", isOk: false },
        { status: 400 },
      );
    }

    const isValid = verifySignature(
      orderCreationId,
      razorpayPaymentId,
      razorpaySignature,
    );

    if (!isValid) {
      return NextResponse.json(
        { message: "Payment verification failed", isOk: false },
        { status: 400 },
      );
    }

    // Update credits in database
    const { data: existingCredits, error: selectError } = await supabase
      .from("credits")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (selectError && selectError.code !== "PGRST116") {
      throw selectError;
    }

    if (existingCredits) {
      const { data, error: updateError } = await supabase
        .from("credits")
        .update({ credits: existingCredits.credits + credits })
        .eq("user_id", userId)
        .select();

      if (updateError) throw updateError;

      const { error: paymentError } = await supabase.from("payments").insert({
        user_id: userId,
        amount,
        currency: currency || "usd",
      });

      if (paymentError) {
        console.error(
          "Failed to insert Razorpay payment record:",
          paymentError,
        );
      }

      return NextResponse.json({
        message: "Payment verified and credits updated successfully",
        isOk: true,
        data,
      });
    } else {
      const { data, error: insertError } = await supabase
        .from("credits")
        .insert({ user_id: userId, credits })
        .select();

      if (insertError) throw insertError;

      const { error: paymentError } = await supabase.from("payments").insert({
        user_id: userId,
        amount,
        currency: currency || "usd",
      });

      if (paymentError) {
        console.error(
          "Failed to insert Razorpay payment record:",
          paymentError,
        );
      }

      return NextResponse.json({
        message: "Payment verified and credits created successfully",
        isOk: true,
        data,
      });
    }
  } catch (error) {
    console.error("Error processing payment verification:", error);
    return NextResponse.json(
      {
        message: "Error processing payment verification",
        isOk: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
