import type { Metadata } from "next";
import Link from "next/link";
import { Mail, ArrowUpRight } from "lucide-react";
import { ContactForm } from "@/components/contact-form";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with ADONISMOB15TH — support, custom order inquiries, and more.",
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl font-semibold">Contact</h1>
      <p className="mt-2 max-w-xl text-ink/60">
        Questions about an order, custom work, or just want to talk to the
        team? Reach out below.
      </p>

      <div className="mt-12 grid gap-12 lg:grid-cols-[1fr_320px]">
        <ContactForm />

        <div className="space-y-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-ink/50">
              Business email
            </p>
            <a href="mailto:hello@adonismob15th.com" className="mt-2 flex items-center gap-2 text-sm text-ink">
              <Mail className="h-4 w-4" /> hello@adonismob15th.com
            </a>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-ink/50">
              Follow
            </p>
            <div className="mt-2 flex gap-4 text-sm text-ink">
              <a href="#" className="flex items-center gap-2 hover:text-gold">
                Instagram <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
              <a href="#" className="flex items-center gap-2 hover:text-gold">
                Twitter <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-ink/50">
              Custom orders
            </p>
            <p className="mt-2 text-sm text-ink/70">
              Have a design in mind? Start a{" "}
              <Link href="/custom-orders" className="font-medium text-ink underline">
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
