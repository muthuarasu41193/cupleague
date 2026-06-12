import { PREMIUM_PRICE_PAISE } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";
import Razorpay from "razorpay";
import { NextResponse } from "next/server";

/**
 * POST /api/create-order
 * Creates a Razorpay order for the ₹499 premium upgrade.
 */
export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    return NextResponse.json(
      { error: "Razorpay not configured" },
      { status: 500 }
    );
  }

  const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });

  try {
    const order = await razorpay.orders.create({
      amount: PREMIUM_PRICE_PAISE,
      currency: "INR",
      receipt: `premium_${user.id.slice(0, 8)}_${Date.now()}`,
      notes: { user_id: user.id },
    });

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (err) {
    console.error("Razorpay order error:", err);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}
