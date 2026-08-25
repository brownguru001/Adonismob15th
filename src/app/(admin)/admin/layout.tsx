import Link from "next/link";
import { requireAdmin } from "@/lib/authz";
import { signOut } from "@/lib/auth";
import { AdminMobileMenu } from "@/components/admin/admin-mobile-menu";

const navGroups = [
  {
    label: "Overview",
    links: [{ href: "/admin", label: "Dashboard" }],
  },
  {
    label: "Business",
    links: [
      { href: "/admin/orders", label: "Orders" },
      { href: "/admin/products", label: "Products" },
      { href: "/admin/designs", label: "Designs" },
      { href: "/admin/collections", label: "Collections" },
      { href: "/admin/custom-orders", label: "Custom Orders" },
    ],
  },
  {
    label: "People",
    links: [
      { href: "/admin/members", label: "Members" },
      { href: "/admin/access", label: "Access" },
    ],
  },
  {
    label: "Operations",
    links: [
      { href: "/admin/suppliers", label: "Suppliers" },
      { href: "/admin/production", label: "Production" },
      { href: "/admin/payments", label: "Payments" },
      { href: "/admin/messages", label: "Messages" },
    ],
  },
  {
    label: "Insights",
    links: [
      { href: "/admin/analytics", label: "Analytics" },
      { href: "/admin/settings", label: "Settings" },
    ],
  },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin();

  async function handleSignOut() {
    "use server";
    await signOut({ redirectTo: "/" });
  }

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <AdminMobileMenu navGroups={navGroups} email={user.email ?? ""} onSignOut={handleSignOut} />
      <aside className="hidden w-64 shrink-0 flex-col border-r border-gold/10 bg-ink-soft text-bone md:flex">
        <div className="px-6 py-6">
          <Link href="/admin" className="font-display text-lg font-semibold">
            ADONISMOB<span className="text-gold">15TH</span>
          </Link>
          <p className="mt-0.5 text-xs text-bone/40">Business Admin</p>
        </div>
        <nav className="flex-1 space-y-6 overflow-y-auto px-4 pb-6">
          {navGroups.map((group) => (
            <div key={group.label}>
              <p className="px-2 text-[10px] font-semibold uppercase tracking-wider text-bone/30">
                {group.label}
              </p>
              <div className="mt-1 space-y-0.5">
                {group.links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="block rounded-lg px-2 py-2 text-sm text-bone/70 hover:bg-bone/10 hover:text-bone"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </nav>
        <div className="border-t border-bone/10 px-4 py-4">
          <p className="px-2 text-xs text-bone/50">{user.email}</p>
          <div className="mt-2 flex gap-3 px-2 text-xs">
            <Link href="/dashboard" className="text-bone/50 hover:text-bone">
              View site
            </Link>
            <form action={handleSignOut}>
              <button className="text-bone/50 hover:text-bone">Sign out</button>
            </form>
          </div>
        </div>
      </aside>
      <main className="min-w-0 flex-1 p-6 md:p-10">{children}</main>
    </div>
  );
}
