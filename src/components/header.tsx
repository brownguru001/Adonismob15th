import Link from "next/link";
import { auth, signOut } from "@/lib/auth";
import { CartLink } from "@/components/cart-link";
import { Menu } from "@/components/mobile-menu";

const navLinks = [
  { href: "/dashboard/products", label: "Products" },
  { href: "/dashboard/collections", label: "Collections" },
  { href: "/dashboard/custom-orders", label: "Custom Orders" },
  { href: "/dashboard/orders", label: "Orders" },
];

// Only ever rendered inside the (member) layout, which already enforces
// requireMember() — this assumes an authenticated session exists.
export async function Header() {
  const session = await auth();
  const user = session?.user;

  async function handleSignOut() {
    "use server";
    await signOut({ redirectTo: "/" });
  }

  return (
    <header className="sticky top-0 z-50 border-b border-bone/10 bg-ink/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/dashboard" className="font-display text-xl font-semibold tracking-tight">
          ADONISMOB<span className="text-gold">15TH</span>
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-medium md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-bone/70 transition hover:text-bone"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <CartLink />
          <div className="hidden items-center gap-3 md:flex">
            {user?.role === "ADMIN" && (
              <Link href="/admin" className="text-sm font-medium text-bone/70 hover:text-bone">
                Admin
              </Link>
            )}
            <Link href="/dashboard/account" className="text-sm font-medium text-bone/70 hover:text-bone">
              Account
            </Link>
            <form action={handleSignOut}>
              <button className="text-sm font-medium text-bone/70 hover:text-bone">
                Sign out
              </button>
            </form>
          </div>
          <Menu links={navLinks} isAdmin={user?.role === "ADMIN"} onSignOut={handleSignOut} />
        </div>
      </div>
    </header>
  );
}
