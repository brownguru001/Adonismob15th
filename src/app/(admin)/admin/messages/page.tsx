import { prisma } from "@/lib/prisma";
import { MessageReadButton } from "@/components/admin/message-read-button";

export default async function AdminMessagesPage() {
  const messages = await prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">Messages</h1>
      <p className="mt-1 text-sm text-ink/50">Submissions from the public contact form.</p>

      <div className="mt-6 space-y-3">
        {messages.map((m) => (
          <div key={m.id} className="rounded-xl border border-ink/10 bg-white p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium">{m.subject}</p>
                <p className="text-xs text-ink/50">{m.name} &middot; {m.email}</p>
              </div>
              <MessageReadButton id={m.id} isRead={m.isRead} />
            </div>
            <p className="mt-2 text-sm text-ink/70">{m.message}</p>
            <p className="mt-2 text-xs text-ink/30">{new Date(m.createdAt).toLocaleString()}</p>
          </div>
        ))}
        {messages.length === 0 && <p className="text-ink/40">No messages yet.</p>}
      </div>
    </div>
  );
}
