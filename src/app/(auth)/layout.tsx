import Link from "next/link";
import { RoseMotif } from "@/components/rose-motif";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-ink px-4 py-16">
      <RoseMotif className="pointer-events-none absolute left-1/2 top-1/2 h-[130vh] w-auto -translate-x-1/2 -translate-y-1/2 text-gold opacity-[0.1]" />

      <div className="relative w-full max-w-md">
        <Link href="/" className="mb-8 block text-center font-display text-2xl font-semibold text-bone">
          ADONISMOB<span className="text-gold">15TH</span>
        </Link>
        <div className="rounded-2xl bg-bone p-8 text-ink">{children}</div>
      </div>
    </div>
  );
}
