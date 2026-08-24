import { requireMember } from "@/lib/authz";
import { PasswordChangeForm } from "@/components/password-change-form";

export default async function AccountPage() {
  const user = await requireMember();

  return (
    <div className="mx-auto max-w-lg px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="font-display text-2xl font-semibold">Account</h1>
      <p className="mt-1 text-sm text-ink/60">{user.name} &middot; {user.email}</p>

      <div className="mt-8 rounded-xl border border-ink/10 bg-white p-6">
        <p className="font-semibold text-ink">Change password</p>
        <p className="mt-1 text-sm text-ink/50">
          You&apos;ll need your current password to set a new one.
        </p>
        <div className="mt-4">
          <PasswordChangeForm />
        </div>
      </div>
    </div>
  );
}
