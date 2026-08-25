import { PasswordChangeForm } from "@/components/password-change-form";

function EnvStatus({ label, isSet }: { label: string; isSet: boolean }) {
  return (
    <div className="flex items-center justify-between border-b border-bone/5 py-3 text-sm last:border-0">
      <span>{label}</span>
      <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${isSet ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
        {isSet ? "Configured" : "Not set"}
      </span>
    </div>
  );
}

export default function AdminSettingsPage() {
  const checks = [
    { label: "Database (DATABASE_URL)", isSet: !!process.env.DATABASE_URL },
    { label: "Auth secret (AUTH_SECRET)", isSet: !!process.env.AUTH_SECRET },
    { label: "Flutterwave secret key", isSet: !!process.env.FLUTTERWAVE_SECRET_KEY },
    { label: "Flutterwave public key", isSet: !!process.env.FLUTTERWAVE_PUBLIC_KEY },
    { label: "Flutterwave webhook secret hash", isSet: !!process.env.FLUTTERWAVE_WEBHOOK_SECRET_HASH },
  ];

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-2xl font-semibold">Settings</h1>
      <p className="mt-1 text-sm text-bone/50">
        Environment configuration status. Secrets are never displayed here —
        set actual values via environment variables on your hosting
        platform, never in source control.
      </p>

      <div className="mt-6 rounded-xl border border-bone/10 bg-ink-soft p-6">
        {checks.map((c) => (
          <EnvStatus key={c.label} label={c.label} isSet={c.isSet} />
        ))}
      </div>

      <div className="mt-6 rounded-xl border border-bone/10 bg-ink-soft p-6 text-sm text-bone/60">
        <p className="font-semibold text-bone">Business info</p>
        <p className="mt-2">ADONISMOB15TH &middot; Lagos, Nigeria</p>
        <p>hello@adonismob15th.com</p>
      </div>

      <div className="mt-6 rounded-xl border border-bone/10 bg-ink-soft p-6">
        <p className="font-semibold text-bone">Change password</p>
        <p className="mt-1 text-sm text-bone/50">
          Update your own admin login credential.
        </p>
        <div className="mt-4">
          <PasswordChangeForm />
        </div>
      </div>
    </div>
  );
}
