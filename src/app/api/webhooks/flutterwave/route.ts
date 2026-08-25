import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { confirmFlutterwaveTransaction } from "@/lib/payment-verification";

// Plain !== on a shared secret leaks comparison time character-by-character;
// timingSafeEqual takes the same time regardless of where a mismatch starts.
// It requires equal-length buffers, so a length mismatch is checked (and
// rejected) separately first.
function signatureMatches(provided: string | null, expected: string) {
  if (!provided) return false;
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

// Backstop for the redirect callback (covers cases where the customer closes
// the tab before the redirect completes). Verified by the shared secret hash
// header, then re-confirmed against Flutterwave's API — never trusted as-is.
export async function POST(req: NextRequest) {
  const signature = req.headers.get("verif-hash");
  const expected = process.env.FLUTTERWAVE_WEBHOOK_SECRET_HASH;

  if (!expected || !signatureMatches(signature, expected)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const body = await req.json();
  const transactionId = body?.data?.id;
  if (!transactionId) {
    return NextResponse.json({ error: "Missing transaction id" }, { status: 400 });
  }

  const result = await confirmFlutterwaveTransaction(String(transactionId));
  return NextResponse.json({ received: true, ok: result.ok });
}
