import { notFound } from "next/navigation";
import Image from "next/image";
import { requireMember } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import { formatNaira } from "@/lib/utils";
import { CustomOrderApproveButton } from "@/components/custom-order-approve-button";
import { CustomOrderBankTransferClaimButton } from "@/components/custom-order-bank-transfer-claim-button";

export default async function CustomOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireMember();

  const customOrder = await prisma.customOrder.findUnique({
    where: { id },
    include: { statusEvents: { orderBy: { createdAt: "asc" } }, payments: true },
  });

  if (!customOrder || (customOrder.userId !== user.id && user.role !== "ADMIN")) notFound();

  const bankTransfer = customOrder.payments.find((p) => p.provider === "BANK_TRANSFER");

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
      <p className="text-xs font-semibold uppercase tracking-wide text-bone/50">
        Custom order request
      </p>
      <h1 className="font-display text-2xl font-semibold">{customOrder.productType}</h1>
      <p className="mt-1 text-sm text-bone/60">
        Submitted {new Date(customOrder.createdAt).toLocaleDateString()}
      </p>

      {customOrder.status === "QUOTE_SENT" && customOrder.quotedPrice && !bankTransfer && (
        <div className="mt-6 rounded-xl border border-gold/30 bg-gold/10 p-6 text-sm">
          <p className="font-semibold text-bone">Quote ready</p>
          <p className="mt-2 text-bone/70">
            We&apos;ve quoted <span className="font-semibold text-bone">{formatNaira(customOrder.quotedPrice)}</span> for this request.
          </p>
          <CustomOrderApproveButton customOrderId={customOrder.id} />
        </div>
      )}

      {bankTransfer && bankTransfer.status === "PENDING" && (
        <div className="mt-6 rounded-xl border border-gold/30 bg-gold/10 p-6 text-sm">
          <p className="font-semibold text-bone">Pay by bank transfer</p>
          {process.env.BANK_ACCOUNT_NUMBER ? (
            <>
              <p className="mt-2 text-bone/70">
                Transfer <span className="font-semibold text-bone">{formatNaira(bankTransfer.amount)}</span> to:
              </p>
              <div className="mt-3 space-y-1 text-bone">
                <p>{process.env.BANK_NAME}</p>
                <p className="font-mono">{process.env.BANK_ACCOUNT_NUMBER}</p>
                <p>{process.env.BANK_ACCOUNT_NAME}</p>
              </div>
              <p className="mt-3 text-xs text-bone/50">
                Please include this request&apos;s reference in your transfer description: <span className="font-mono">{customOrder.id}</span>
              </p>
            </>
          ) : (
            <p className="mt-2 text-bone/70">
              Bank details aren&apos;t set up yet — contact us directly to arrange payment for this request.
            </p>
          )}
          <CustomOrderBankTransferClaimButton customOrderId={customOrder.id} />
        </div>
      )}

      {bankTransfer && bankTransfer.status === "AWAITING_VERIFICATION" && (
        <div className="mt-6 rounded-xl border border-bone/10 bg-ink-soft p-6 text-sm text-bone/70">
          <p className="font-semibold text-bone">Payment reported — awaiting confirmation</p>
          <p className="mt-1">
            We&apos;ll move this to production once we&apos;ve confirmed the transfer landed.
          </p>
        </div>
      )}

      <div className="mt-8 rounded-xl border border-bone/10 p-6">
        <p className="text-sm font-semibold uppercase tracking-wide text-bone/50">Timeline</p>
        <div className="mt-4 space-y-3">
          {customOrder.statusEvents.map((event) => (
            <div key={event.id} className="flex items-start gap-3 text-sm">
              <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-gold" />
              <div>
                <p className="font-medium text-bone">{event.status.replace("_", " ")}</p>
                {event.note && <p className="text-bone/50">{event.note}</p>}
                <p className="text-xs text-bone/40">{new Date(event.createdAt).toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 space-y-4 rounded-xl border border-bone/10 p-6 text-sm">
        <div>
          <p className="text-bone/50">Quantity</p>
          <p className="font-medium">{customOrder.quantity}</p>
        </div>
        <div>
          <p className="text-bone/50">Sizes</p>
          <p className="font-medium">{customOrder.sizes}</p>
        </div>
        {customOrder.colorPreference && (
          <div>
            <p className="text-bone/50">Color preference</p>
            <p className="font-medium">{customOrder.colorPreference}</p>
          </div>
        )}
        <div>
          <p className="text-bone/50">Design notes</p>
          <p className="font-medium">{customOrder.designNotes}</p>
        </div>
        {customOrder.quotedPrice && (
          <div>
            <p className="text-bone/50">Quoted price</p>
            <p className="font-medium">{formatNaira(customOrder.quotedPrice)}</p>
          </div>
        )}
        {customOrder.referenceImages.length > 0 && (
          <div>
            <p className="text-bone/50">Reference artwork</p>
            <div className="mt-2 flex flex-wrap gap-3">
              {customOrder.referenceImages.map((url) => (
                <div key={url} className="relative h-20 w-20 overflow-hidden rounded-lg">
                  <Image src={url} alt="Reference" fill className="object-cover" sizes="80px" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
