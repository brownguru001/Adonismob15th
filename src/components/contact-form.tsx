"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { submitContactMessage } from "@/app/(site)/contact/actions";

export function ContactForm() {
  const [isPending, startTransition] = useTransition();
  const [sent, setSent] = useState(false);

  return (
    <form
      action={(formData) => {
        startTransition(async () => {
          const result = await submitContactMessage(formData);
          if (result.ok) {
            setSent(true);
            toast.success("Message sent — we'll get back to you soon.");
          } else {
            toast.error(result.error);
          }
        });
      }}
      className="space-y-4"
    >
      {sent ? (
        <p className="rounded-lg bg-bone-dim p-6 text-sm text-ink/70">
          Thanks for reaching out. We&apos;ll reply to your email shortly.
        </p>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <input
              name="name"
              required
              placeholder="Your name"
              className="rounded-lg border border-ink/15 px-4 py-3 text-sm outline-none focus:border-ink"
            />
            <input
              name="email"
              type="email"
              required
              placeholder="Your email"
              className="rounded-lg border border-ink/15 px-4 py-3 text-sm outline-none focus:border-ink"
            />
          </div>
          <input
            name="subject"
            required
            placeholder="Subject"
            className="w-full rounded-lg border border-ink/15 px-4 py-3 text-sm outline-none focus:border-ink"
          />
          <textarea
            name="message"
            required
            rows={5}
            placeholder="How can we help?"
            className="w-full rounded-lg border border-ink/15 px-4 py-3 text-sm outline-none focus:border-ink"
          />
          <button
            disabled={isPending}
            className="rounded-full bg-ink px-6 py-3 text-sm font-semibold text-bone hover:bg-ink-soft disabled:opacity-50"
          >
            {isPending ? "Sending..." : "Send message"}
          </button>
        </>
      )}
    </form>
  );
}
