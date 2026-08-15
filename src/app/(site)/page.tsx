import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Lock, Scissors, Sparkles, Truck } from "lucide-react";
import { getFeaturedProducts, getLatestProducts } from "@/lib/catalog";
import { getOptionalUser } from "@/lib/authz";
import { ProductCard } from "@/components/product-card";

export default async function HomePage() {
  const user = await getOptionalUser();
  const [featured, latest] = await Promise.all([
    getFeaturedProducts(user, 4),
    getLatestProducts(user, 8),
  ]);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-ink text-bone">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:items-center lg:px-8 lg:py-32">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">
              New Season
            </p>
            <h1 className="mt-4 font-display text-4xl font-semibold leading-[1.05] text-balance sm:text-5xl lg:text-6xl">
              Clothing built on identity, not trends.
            </h1>
            <p className="mt-6 max-w-md text-base text-bone/70">
              ADONISMOB15TH designs original pieces rooted in African
              craft and modern streetwear — worn by a growing community,
              made to order when you want it personal.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 rounded-full bg-gold px-6 py-3 text-sm font-semibold text-ink transition hover:bg-gold-soft"
              >
                Shop the collection <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/custom-orders"
                className="inline-flex items-center gap-2 rounded-full border border-bone/30 px-6 py-3 text-sm font-semibold text-bone transition hover:border-bone"
              >
                Start a custom order
              </Link>
            </div>
          </div>
          <div className="relative aspect-[4/5] overflow-hidden rounded-2xl lg:aspect-[3/4]">
            <Image
              src="https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=1200&q=80"
              alt="ADONISMOB15TH lookbook"
              fill
              priority
              className="object-cover"
              sizes="(min-width: 1024px) 50vw, 100vw"
            />
          </div>
        </div>
      </section>

      {/* Featured collection */}
      {featured.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">
                Featured
              </p>
              <h2 className="mt-2 font-display text-2xl font-semibold sm:text-3xl">
                This season&apos;s standouts
              </h2>
            </div>
            <Link href="/shop" className="hidden text-sm font-medium text-ink/60 hover:text-ink sm:block">
              View all &rarr;
            </Link>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-4">
            {featured.map((product) => (
              <ProductCard key={product.id} product={{ ...product, price: product.price.toString() }} />
            ))}
          </div>
        </section>
      )}

      {/* Latest designs */}
      {latest.length > 0 && (
        <section className="bg-bone-dim/60 py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">
              Latest Drops
            </p>
            <h2 className="mt-2 font-display text-2xl font-semibold sm:text-3xl">
              Fresh from the studio
            </h2>
            <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-4">
              {latest.slice(0, 4).map((product) => (
                <ProductCard key={product.id} product={{ ...product, price: product.price.toString() }} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Brand story */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
            <Image
              src="https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1200&q=80"
              alt="ADONISMOB15TH design process"
              fill
              className="object-cover"
              sizes="(min-width: 1024px) 50vw, 100vw"
            />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">
              Our Story
            </p>
            <h2 className="mt-2 font-display text-3xl font-semibold text-balance">
              Designed in Lagos, made for a global community.
            </h2>
            <p className="mt-4 text-ink/70">
              ADONISMOB15TH started as a small run of original designs
              among a tight community and grew into a brand people ask to
              be part of. Every piece is designed in-house — the print and
              production is handled by verified commercial partners while
              we build toward in-house production of our own.
            </p>
            <Link
              href="/about"
              className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-ink hover:text-gold"
            >
              Read our story <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Custom clothing */}
      <section className="bg-ink text-bone">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:items-center lg:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">
              Made to order
            </p>
            <h2 className="mt-2 font-display text-3xl font-semibold text-balance">
              Bring your own design. We&apos;ll produce it.
            </h2>
            <p className="mt-4 max-w-md text-bone/70">
              Submit your artwork, colorway, and sizing — our team quotes,
              you approve, and we take it into production with our
              printing partners. Track every stage from submission to
              fulfillment.
            </p>
            <Link
              href="/custom-orders"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-gold px-6 py-3 text-sm font-semibold text-ink hover:bg-gold-soft"
            >
              Start your custom order <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            {[
              { icon: Scissors, label: "Your design, our production" },
              { icon: Sparkles, label: "Quote before you commit" },
              { icon: Truck, label: "Tracked through fulfillment" },
              { icon: Lock, label: "Secure payment, verified orders" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="rounded-xl border border-bone/15 p-5">
                <Icon className="h-5 w-5 text-gold" />
                <p className="mt-3 text-bone/80">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Members Collection teaser */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-ink to-ink-soft">
          <div className="grid gap-8 p-10 lg:grid-cols-2 lg:items-center lg:p-16">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">
                Verified Members Only
              </p>
              <h2 className="mt-2 font-display text-3xl font-semibold text-bone text-balance">
                An exclusive collection, reserved for our community.
              </h2>
              <p className="mt-4 max-w-md text-bone/70">
                Verified members get access to designs, colorways, and
                limited runs that never reach the public shop.
              </p>
              <Link
                href="/members"
                className="mt-6 inline-flex items-center gap-2 rounded-full border border-gold px-6 py-3 text-sm font-semibold text-gold hover:bg-gold hover:text-ink"
              >
                Explore membership <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="relative aspect-[4/3] overflow-hidden rounded-xl">
              <Image
                src="https://images.unsplash.com/photo-1552374196-c4e7ffc6e126?w=1200&q=80"
                alt="Members collection preview"
                fill
                className="object-cover opacity-90"
                sizes="(min-width: 1024px) 50vw, 100vw"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Why ADONISMOB15TH */}
      <section className="bg-bone-dim/60 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">
            Why ADONISMOB15TH
          </p>
          <h2 className="mt-2 font-display text-2xl font-semibold sm:text-3xl">
            Built for people who want more than a t-shirt drop.
          </h2>
          <div className="mt-10 grid gap-8 sm:grid-cols-3">
            {[
              {
                title: "Original design",
                body: "Every piece starts as an in-house design, not a template pulled off a marketplace.",
              },
              {
                title: "Real production workflow",
                body: "Orders move through a defined print-and-fulfillment pipeline with verified suppliers.",
              },
              {
                title: "A community, not just customers",
                body: "Verified members get first access, exclusive drops, and a direct line to the brand.",
              },
            ].map((item) => (
              <div key={item.title}>
                <h3 className="font-display text-lg font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm text-ink/60">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 py-20 text-center sm:px-6 lg:px-8">
        <h2 className="font-display text-3xl font-semibold text-balance sm:text-4xl">
          Ready to wear the story?
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-ink/60">
          Browse the current collection, or reach out if you&apos;re
          building toward a partnership with us.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link
            href="/shop"
            className="rounded-full bg-ink px-6 py-3 text-sm font-semibold text-bone hover:bg-ink-soft"
          >
            Shop now
          </Link>
          <Link
            href="/contact"
            className="rounded-full border border-ink/20 px-6 py-3 text-sm font-semibold text-ink hover:border-ink"
          >
            Contact us
          </Link>
        </div>
      </section>
    </>
  );
}
