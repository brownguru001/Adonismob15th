import "server-only";

const FLW_BASE_URL = "https://api.flutterwave.com/v3";

function secretKey() {
  const key = process.env.FLUTTERWAVE_SECRET_KEY;
  if (!key) throw new Error("FLUTTERWAVE_SECRET_KEY is not configured");
  return key;
}

export type InitiatePaymentInput = {
  txRef: string;
  amount: number;
  currency?: string;
  customerEmail: string;
  customerName: string;
  customerPhone?: string;
  redirectUrl: string;
  title?: string;
};

export type FlutterwaveInitResponse = {
  status: string;
  message: string;
  data?: { link: string };
};

/** Creates a hosted payment link. Never called from the client — secret key stays server-side. */
export async function initiatePayment(input: InitiatePaymentInput): Promise<FlutterwaveInitResponse> {
  const res = await fetch(`${FLW_BASE_URL}/payments`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      tx_ref: input.txRef,
      amount: input.amount,
      currency: input.currency ?? "NGN",
      redirect_url: input.redirectUrl,
      customer: {
        email: input.customerEmail,
        name: input.customerName,
        phonenumber: input.customerPhone,
      },
      customizations: {
        title: input.title ?? "ADONISMOB15TH",
      },
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Flutterwave payment initiation failed: ${res.status} ${body}`);
  }

  return res.json();
}

export type FlutterwaveVerifyResponse = {
  status: string;
  message: string;
  data?: {
    id: number;
    tx_ref: string;
    flw_ref: string;
    amount: number;
    currency: string;
    status: string;
    customer: { email: string };
  };
};

/**
 * Re-fetches the transaction directly from Flutterwave by its transaction id.
 * This is the ONLY trustworthy way to confirm payment — callback query params
 * and webhook payloads are both attacker-influenceable and must never be
 * trusted on their own.
 */
export async function verifyTransaction(transactionId: string | number): Promise<FlutterwaveVerifyResponse> {
  const res = await fetch(`${FLW_BASE_URL}/transactions/${transactionId}/verify`, {
    headers: { Authorization: `Bearer ${secretKey()}` },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Flutterwave verification failed: ${res.status} ${body}`);
  }

  return res.json();
}
