import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "About",
  description: "The story behind ADONISMOB15TH — a modern clothing brand rooted in African identity.",
};

export default function AboutPage() {
  return (
    <div>
      <section className="bg-ink text-bone">
        <div className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">
            About Us
          </p>
          <h1 className="mt-4 font-display text-4xl font-semibold text-balance sm:text-5xl">
            A brand built by a community, for a community.
          </h1>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="relative mb-10 aspect-[16/9] overflow-hidden rounded-2xl">
          <Image
            src="https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?w=1400&q=80"
            alt="ADONISMOB15TH"
            fill
            className="object-cover"
            sizes="100vw"
          />
        </div>

        <div className="prose prose-neutral max-w-none space-y-6 text-ink/80">
          <p>
            ADONISMOB15TH began as a small collection of original designs
            shared within a close community. What started as a handful of
            pieces has grown into a working clothing brand — one built on
            deliberate design, not trend-chasing.
          </p>
          <p>
            Every product starts as an original design. We work with
            verified commercial printing partners to bring designs to life
            while we build toward owning our own production equipment —
            a step that will let us shorten lead times, expand our
            catalog, and take on more custom work.
          </p>
          <p>
            Alongside the public collection, we maintain an exclusive
            collection for verified members of our community — pieces and
            colorways that never reach the general shop. Membership is a
            way of recognizing the people who have supported the brand
            from early on.
          </p>
          <p>
            ADONISMOB15TH is African-rooted in its references and
            confident in its execution — clothing meant to be worn, not
            just collected.
          </p>
        </div>
      </section>
    </div>
  );
}
