import { requireMember } from "@/lib/authz";
import { CheckoutForm } from "@/components/checkout-form";

export default async function CheckoutPage() {
  const user = await requireMember();

  if (user.role === "ADMIN") {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center sm:px-6">
        <h1 className="font-display text-2xl font-semibold">Admin accounts can&apos;t check out</h1>
        <p className="mt-2 text-bone/60">
          This storefront is for members. Use a member account to place a
          test order, or manage real orders from the admin dashboard.
        </p>
      </div>
    );
  }

  return <CheckoutForm />;
}
