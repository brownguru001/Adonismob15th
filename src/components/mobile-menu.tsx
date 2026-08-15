"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu as MenuIcon, X } from "lucide-react";

export function Menu({
  links,
  isAuthed,
  isAdmin,
}: {
  links: { href: string; label: string }[];
  isAuthed: boolean;
  isAdmin: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Menu"
        className="text-ink/80"
      >
        {open ? <X className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
      </button>
      {open && (
        <div className="absolute inset-x-0 top-full border-b border-ink/10 bg-bone px-4 py-4">
          <nav className="flex flex-col gap-4 text-sm font-medium">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="text-ink/80"
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-2 border-t border-ink/10 pt-4">
              {isAdmin && (
                <Link href="/admin" onClick={() => setOpen(false)} className="block py-1 text-ink/80">
                  Admin
                </Link>
              )}
              {isAuthed ? (
                <Link href="/account" onClick={() => setOpen(false)} className="block py-1 text-ink/80">
                  Account
                </Link>
              ) : (
                <Link href="/login" onClick={() => setOpen(false)} className="block py-1 text-ink/80">
                  Sign in
                </Link>
              )}
            </div>
          </nav>
        </div>
      )}
    </div>
  );
}
