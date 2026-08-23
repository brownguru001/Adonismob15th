import { signOut } from "@/lib/auth";
import { requireUser } from "@/lib/authz";

export default async function AccessRestrictedPage() {
  await requireUser();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-ink px-6 text-center">
      <p className="font-display text-2xl font-semibold text-bone">Access restricted</p>
      <p className="mt-3 max-w-sm text-sm text-bone/50">
        Your access to this platform has been suspended or revoked. Contact
        an administrator if you believe this is a mistake.
      </p>
      <form
        action={async () => {
          "use server";
          await signOut({ redirectTo: "/" });
        }}
      >
        <button className="mt-8 rounded-full border border-bone/30 px-6 py-2.5 text-sm font-medium text-bone hover:border-bone">
          Sign out
        </button>
      </form>
    </div>
  );
}
