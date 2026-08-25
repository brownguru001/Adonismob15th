import type { Metadata } from "next";
import Link from "next/link";
import { Mail } from "lucide-react";
import { ContactForm } from "@/components/contact-form";

export const metadata: Metadata = {
  title: "Contact",
  robots: { index: false, follow: false },
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl font-semibold">Contact</h1>
      <p className="mt-2 max-w-xl text-bone/60">
        Questions about an order, custom work, or membership? Reach the team below.
      </p>

      <div className="mt-12 grid gap-12 lg:grid-cols-[1fr_320px]">
        <ContactForm />

        <div className="space-y-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-bone/50">
              Direct line
            </p>
            <a href="mailto:hello@adonismob15th.com" className="mt-2 flex items-center gap-2 text-sm text-bone">
              <Mail className="h-4 w-4" /> hello@adonismob15th.com
            </a>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-bone/50">
              Custom orders
            </p>
            <p className="mt-2 text-sm text-bone/70">
              Have a design in mind? Start a{" "}
              <Link href="/dashboard/custom-orders" className="font-medium text-bone underline">
                custom order request
              </Link>{" "}
              directly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
