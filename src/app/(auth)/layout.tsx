import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-ink px-4 py-16">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-8 block text-center font-display text-2xl font-semibold text-bone">
          ADONISMOB<span className="text-gold">15TH</span>
        </Link>
        <div className="rounded-2xl bg-bone p-8">{children}</div>
      </div>
    </div>
  );
}
