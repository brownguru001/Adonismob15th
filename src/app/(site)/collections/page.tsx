import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getCollections } from "@/lib/catalog";
import { getOptionalUser } from "@/lib/authz";

export const metadata: Metadata = {
  title: "Collections",
  description: "Explore ADONISMOB15TH collections, from new drops to limited editions.",
};

export default async function CollectionsPage() {
  const user = await getOptionalUser();
  const collections = await getCollections(user);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl font-semibold">Collections</h1>
      <p className="mt-2 text-ink/60">Curated drops, seasonal and limited.</p>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {collections.map((c) => (
          <Link
            key={c.id}
            href={`/collections/${c.slug}`}
            className="group relative aspect-[4/3] overflow-hidden rounded-xl bg-ink"
          >
            {c.coverImage && (
              <Image
                src={c.coverImage}
                alt={c.name}
                fill
                className="object-cover opacity-80 transition group-hover:scale-105 group-hover:opacity-90"
                sizes="(min-width: 1024px) 33vw, 50vw"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/10 to-transparent" />
            <div className="absolute bottom-0 p-5">
              {c.visibility === "MEMBERS_ONLY" && (
                <span className="mb-2 inline-block rounded-full bg-gold px-2 py-0.5 text-[10px] font-semibold uppercase text-ink">
                  Members
                </span>
              )}
              <p className="font-display text-lg font-semibold text-bone">{c.name}</p>
              <p className="text-xs text-bone/60">{c._count.products} pieces</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
