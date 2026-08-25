import { redirect } from "next/navigation";
import Link from "next/link";
import { getOptionalUser } from "@/lib/authz";
import { RoseMotif } from "@/components/rose-motif";

export default async function GatePage() {
  const user = await getOptionalUser();
  if (user) redirect("/dashboard");

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-ink px-6 text-center">
      <RoseMotif className="pointer-events-none absolute left-1/2 top-1/2 h-[130vh] w-auto -translate-x-1/2 -translate-y-1/2 text-gold opacity-[0.12]" />

      <p className="relative font-display text-3xl font-semibold tracking-tight text-bone">
        ADONISMOB<span className="text-gold">15TH</span>
      </p>
      <p className="relative mt-3 max-w-xs text-sm text-bone/50">
        Private platform. Access is by invitation only.
      </p>
      <Link
        href="/login"
        className="relative mt-10 rounded-full bg-bone px-8 py-3 text-sm font-semibold text-ink transition hover:bg-bone/90"
      >
        Sign in
      </Link>
    </div>
  );
}
