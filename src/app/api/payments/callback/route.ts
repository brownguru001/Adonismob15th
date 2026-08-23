import { NextRequest, NextResponse } from "next/server";
import { confirmFlutterwaveTransaction } from "@/lib/payment-verification";

// Flutterwave redirects the customer's browser here after checkout. The
// query params (status, tx_ref) are attacker-influenceable — they only tell
// us which transaction to look up, never whether it actually succeeded.
export async function GET(req: NextRequest) {
  const transactionId = req.nextUrl.searchParams.get("transaction_id");
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? req.nextUrl.origin;

  if (!transactionId) {
    return NextResponse.redirect(`${appUrl}/dashboard/checkout?payment=missing`);
  }

  try {
    const result = await confirmFlutterwaveTransaction(transactionId);
    if (!result.ok) {
      return NextResponse.redirect(`${appUrl}/dashboard/checkout?payment=failed`);
    }
    return NextResponse.redirect(
      `${appUrl}/dashboard/orders/${result.order.orderNumber}?payment=success`
    );
  } catch {
    return NextResponse.redirect(`${appUrl}/dashboard/checkout?payment=error`);
  }
}
