"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu as MenuIcon, X } from "lucide-react";

export function Menu({
  links,
  isAdmin,
  onSignOut,
}: {
  links: { href: string; label: string }[];
  isAdmin: boolean;
  onSignOut: () => Promise<void>;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Menu"
        className="text-bone/80"
      >
        {open ? <X className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
      </button>
      {open && (
        <div className="absolute inset-x-0 top-full border-b border-bone/10 bg-ink-soft px-4 py-4">
          <nav className="flex flex-col gap-4 text-sm font-medium">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="text-bone/80"
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-2 border-t border-bone/10 pt-4">
              {isAdmin && (
                <Link href="/admin" onClick={() => setOpen(false)} className="block py-1 text-bone/80">
                  Admin
                </Link>
              )}
              <Link href="/dashboard/account" onClick={() => setOpen(false)} className="block py-1 text-bone/80">
                Account
              </Link>
              <form action={onSignOut}>
                <button className="block py-1 text-left text-bone/80">Sign out</button>
              </form>
            </div>
          </nav>
        </div>
      )}
    </div>
  );
}
