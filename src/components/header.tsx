import Link from "next/link";
import { auth, signOut } from "@/lib/auth";
import { CartLink } from "@/components/cart-link";
import { Menu } from "@/components/mobile-menu";

const navLinks = [
  { href: "/shop", label: "Shop" },
  { href: "/collections", label: "Collections" },
  { href: "/custom-orders", label: "Custom Orders" },
  { href: "/members", label: "Members" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export async function Header() {
  const session = await auth();
  const user = session?.user;

  return (
    <header className="sticky top-0 z-50 border-b border-ink/10 bg-bone/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="font-display text-xl font-semibold tracking-tight">
          ADONISMOB<span className="text-gold">15TH</span>
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-medium md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-ink/70 transition hover:text-ink"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <CartLink />
          {user ? (
            <div className="hidden items-center gap-3 md:flex">
              {user.role === "ADMIN" && (
                <Link
                  href="/admin"
                  className="text-sm font-medium text-ink/70 hover:text-ink"
                >
                  Admin
                </Link>
              )}
              <Link href="/account" className="text-sm font-medium text-ink/70 hover:text-ink">
                Account
              </Link>
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/" });
                }}
              >
                <button className="text-sm font-medium text-ink/70 hover:text-ink">
                  Sign out
                </button>
              </form>
            </div>
          ) : (
            <Link
              href="/login"
              className="hidden rounded-full bg-ink px-5 py-2 text-sm font-medium text-bone transition hover:bg-ink-soft md:inline-flex"
            >
              Sign in
            </Link>
          )}
          <Menu links={navLinks} isAuthed={!!user} isAdmin={user?.role === "ADMIN"} />
        </div>
      </div>
    </header>
  );
}
