import { redirect } from "next/navigation";
import Link from "next/link";
import { getOptionalUser } from "@/lib/authz";

export default async function GatePage() {
  const user = await getOptionalUser();
  if (user) redirect("/dashboard");

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-ink px-6 text-center">
      <p className="font-display text-3xl font-semibold tracking-tight text-bone">
        ADONISMOB<span className="text-gold">15TH</span>
      </p>
      <p className="mt-3 max-w-xs text-sm text-bone/50">
        Private platform. Access is by invitation only.
      </p>
      <Link
        href="/login"
        className="mt-10 rounded-full bg-bone px-8 py-3 text-sm font-semibold text-ink transition hover:bg-bone/90"
      >
        Sign in
      </Link>
    </div>
  );
}
