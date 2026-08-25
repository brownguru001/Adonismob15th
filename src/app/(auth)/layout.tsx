import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 py-16">
      <div className="relative w-full max-w-md">
        <Link href="/" className="mb-8 block text-center font-display text-2xl font-semibold text-bone">
          ADONISMOB<span className="text-gold">15TH</span>
        </Link>
        <div className="rounded-2xl bg-bone p-8 text-ink">{children}</div>
      </div>
    </div>
  );
}
