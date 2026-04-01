import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY!;
const supabase = createClient(supabaseUrl, supabaseSecretKey);

export async function POST(request: NextRequest) {
  try {
    const { transactionId, userId, credits, amount, currency } =
      (await request.json()) as {
        transactionId: string;
        userId: string;
        credits: number;
        amount: number;
        currency: string;
      };

    if (!transactionId || !userId || !credits || !amount) {
      return NextResponse.json(
        { message: "Missing required fields", isOk: false },
        { status: 400 },
      );
    }

    // Verify transaction with Flutterwave API
    const verifyRes = await fetch(
      `https://api.flutterwave.com/v3/transactions/${encodeURIComponent(transactionId)}/verify`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!verifyRes.ok) {
      console.error(
        "Flutterwave verification request failed:",
        verifyRes.status,
      );
      return NextResponse.json(
        { message: "Payment verification failed", isOk: false },
        { status: 400 },
      );
    }

    const verifyData = await verifyRes.json();

    if (
      verifyData.status !== "success" ||
      verifyData.data?.status !== "successful"
    ) {
      console.error("Flutterwave payment not successful:", verifyData);
      return NextResponse.json(
        { message: "Payment verification failed", isOk: false },
        { status: 400 },
      );
    }

    // Verify the amount matches to prevent tampering
    const paidAmount = verifyData.data.amount;
    if (Math.abs(paidAmount - amount) > 0.01) {
      console.error(
        `Flutterwave amount mismatch: expected ${amount}, got ${paidAmount}`,
      );
      return NextResponse.json(
        { message: "Payment amount mismatch", isOk: false },
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
        currency: (currency || "usd").toLowerCase(),
      });

      if (paymentError) {
        console.error(
          "Failed to insert Flutterwave payment record:",
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
        currency: (currency || "usd").toLowerCase(),
      });

      if (paymentError) {
        console.error(
          "Failed to insert Flutterwave payment record:",
          paymentError,
        );
      }

      return NextResponse.json({
        message: "Payment verified and credits updated successfully",
        isOk: true,
        data,
      });
    }
  } catch (error) {
    console.error("Flutterwave verification error:", error);
    return NextResponse.json(
      { message: "Internal server error", isOk: false },
      { status: 500 },
    );
  }
}
