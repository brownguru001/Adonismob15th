import type { Metadata } from "next";
import Link from "next/link";
import { getOptionalUser } from "@/lib/authz";
import { getMembersCollectionProducts } from "@/lib/catalog";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/product-card";

export const metadata: Metadata = {
  title: "Members Collection",
  description: "The ADONISMOB15TH Members Collection — exclusive designs reserved for verified members.",
  robots: { index: false, follow: false },
};

export default async function MembersPage() {
  const user = await getOptionalUser();

  const membership = user
    ? await prisma.membership.findUnique({ where: { userId: user.id } })
    : null;

  const isVerified = user?.role === "ADMIN" || user?.membershipStatus === "VERIFIED";
  const products = isVerified ? await getMembersCollectionProducts(user) : [];

  if (!isVerified) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">
          Verified Members Only
        </p>
        <h1 className="mt-3 font-display text-3xl font-semibold">
          The Exclusive Members Collection
        </h1>
        <p className="mt-4 text-ink/60">
          Access to this collection is limited to verified members of the
          ADONISMOB15TH community. Designs and colorways here never reach
          the public shop.
        </p>

        {!user && (
          <Link
            href="/login?callbackUrl=/members/apply"
            className="mt-8 inline-block rounded-full bg-ink px-6 py-3 text-sm font-semibold text-bone"
          >
            Sign in to apply
          </Link>
        )}

        {user && !membership && (
          <Link
            href="/members/apply"
            className="mt-8 inline-block rounded-full bg-ink px-6 py-3 text-sm font-semibold text-bone"
          >
            Apply for membership
          </Link>
        )}

        {user && membership?.status === "PENDING" && (
          <p className="mt-8 rounded-lg bg-bone-dim p-4 text-sm text-ink/70">
            Your membership application is under review.
          </p>
        )}

        {user && (membership?.status === "SUSPENDED" || membership?.status === "REVOKED") && (
          <p className="mt-8 rounded-lg bg-bone-dim p-4 text-sm text-ink/70">
            Your membership access is currently {membership.status.toLowerCase()}. Contact
            support for details.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">
        Verified Members Only
      </p>
      <h1 className="mt-2 font-display text-3xl font-semibold">Members Collection</h1>
      <p className="mt-2 text-ink/60">Exclusive designs, reserved for you.</p>

      {products.length === 0 ? (
        <p className="mt-16 text-center text-ink/50">
          New pieces are on the way — check back soon.
        </p>
      ) : (
        <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={{ ...product, price: product.price.toString() }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
