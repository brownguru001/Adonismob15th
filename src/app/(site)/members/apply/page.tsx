import { redirect } from "next/navigation";
import { requireUser } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import { ApplyForm } from "@/components/apply-form";

export default async function MembersApplyPage() {
  const user = await requireUser();
  const existing = await prisma.membership.findUnique({ where: { userId: user.id } });

  if (existing) redirect("/members");

  return (
    <div className="mx-auto max-w-lg px-4 py-16 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">
        Membership Application
      </p>
      <h1 className="mt-2 font-display text-3xl font-semibold">Apply for the Members Collection</h1>
      <p className="mt-3 text-ink/60">
        Tell us a little about your connection to ADONISMOB15TH. Our team
        reviews every application manually.
      </p>
      <ApplyForm />
    </div>
  );
}
