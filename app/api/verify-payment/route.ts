import { createClient } from "@/lib/supabase/server";
import crypto from "crypto";
import { NextResponse } from "next/server";

/**
 * POST /api/verify-payment
 * Verifies Razorpay payment signature and sets is_premium = true.
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
  } = body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return NextResponse.json({ error: "Missing payment fields" }, { status: 400 });
  }

  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "Razorpay not configured" },
      { status: 500 }
    );
  }

  // Verify HMAC signature
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // Update profile to premium
  const { error } = await supabase
    .from("profiles")
    .update({ is_premium: true })
    .eq("id", user.id);

  if (error) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { error: "Failed to activate premium" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, is_premium: true });
}
