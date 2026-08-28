import { notFound } from "next/navigation";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { formatNaira } from "@/lib/utils";
import { CustomOrderControl } from "@/components/admin/custom-order-control";
import { CustomOrderBankTransferControl } from "@/components/admin/custom-order-bank-transfer-control";

export default async function AdminCustomOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const customOrder = await prisma.customOrder.findUnique({
    where: { id },
    include: { user: true, statusEvents: { orderBy: { createdAt: "asc" } }, payments: true },
  });

  if (!customOrder) notFound();

  return (
    <div className="max-w-3xl">
      <p className="text-xs font-semibold uppercase tracking-wide text-bone/50">Custom order</p>
      <h1 className="font-display text-2xl font-semibold">{customOrder.productType}</h1>
      <p className="text-sm text-bone/50">
        {customOrder.user.name} &middot; {customOrder.user.email}
      </p>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="space-y-4 rounded-xl border border-bone/10 bg-ink-soft p-6 text-sm">
          <div><p className="text-bone/50">Quantity</p><p className="font-medium">{customOrder.quantity}</p></div>
          <div><p className="text-bone/50">Sizes</p><p className="font-medium">{customOrder.sizes}</p></div>
          {customOrder.colorPreference && (
            <div><p className="text-bone/50">Color preference</p><p className="font-medium">{customOrder.colorPreference}</p></div>
          )}
          <div><p className="text-bone/50">Design notes</p><p className="font-medium">{customOrder.designNotes}</p></div>
          {customOrder.referenceImages.length > 0 && (
            <div>
              <p className="text-bone/50">Reference artwork</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {customOrder.referenceImages.map((url) => (
                  <div key={url} className="relative h-20 w-20 overflow-hidden rounded-lg">
                    <Image src={url} alt="" fill className="object-cover" sizes="80px" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="rounded-xl border border-bone/10 bg-ink-soft p-6">
          <p className="text-sm font-semibold">Update request</p>
          <div className="mt-3">
            <CustomOrderControl
              id={customOrder.id}
              status={customOrder.status}
              quotedPrice={customOrder.quotedPrice ? Number(customOrder.quotedPrice) : null}
              adminNotes={customOrder.adminNotes}
            />
          </div>

          <p className="mt-6 text-sm font-semibold">Payments</p>
          <div className="mt-3 space-y-2 text-sm">
            {customOrder.payments.map((p) => (
              <div key={p.id} className="flex justify-between">
                <span className="font-mono text-xs text-bone/60">{p.txRef}</span>
                <span>{formatNaira(p.amount)} &middot; {p.status}</span>
              </div>
            ))}
            {customOrder.payments.length === 0 && <p className="text-bone/40">No payments recorded.</p>}
          </div>
          {customOrder.payments.some((p) => p.provider === "BANK_TRANSFER" && p.status === "AWAITING_VERIFICATION") && (
            <CustomOrderBankTransferControl customOrderId={customOrder.id} />
          )}

          <p className="mt-6 text-sm font-semibold">Timeline</p>
          <div className="mt-3 space-y-2 text-sm">
            {customOrder.statusEvents.map((e) => (
              <div key={e.id} className="flex justify-between">
                <span>{e.status.replace(/_/g, " ")}</span>
                <span className="text-bone/40">{new Date(e.createdAt).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
