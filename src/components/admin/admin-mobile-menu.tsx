"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu as MenuIcon, X } from "lucide-react";

type NavGroup = { label: string; links: { href: string; label: string }[] };

export function AdminMobileMenu({
  navGroups,
  email,
  onSignOut,
}: {
  navGroups: NavGroup[];
  email: string;
  onSignOut: () => Promise<void>;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-gold/10 bg-ink-soft md:hidden">
      <div className="flex items-center justify-between px-4 py-4">
        <Link
          href="/admin"
          className="font-display text-lg font-semibold text-bone"
          onClick={() => setOpen(false)}
        >
          ADONISMOB<span className="text-gold">15TH</span>
        </Link>
        <button onClick={() => setOpen((o) => !o)} aria-label="Menu" className="text-bone/80">
          {open ? <X className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <nav className="max-h-[70vh] overflow-y-auto border-t border-bone/10 px-4 pb-6">
          {navGroups.map((group) => (
            <div key={group.label} className="mt-4">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-bone/30">
                {group.label}
              </p>
              <div className="mt-1 space-y-0.5">
                {group.links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="block rounded-lg px-2 py-2 text-sm text-bone/70 hover:bg-bone/10 hover:text-bone"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
          <div className="mt-4 border-t border-bone/10 pt-4 text-xs">
            <p className="px-2 text-bone/50">{email}</p>
            <div className="mt-2 flex gap-3 px-2">
              <Link href="/dashboard" onClick={() => setOpen(false)} className="text-bone/50 hover:text-bone">
                View site
              </Link>
              <form action={onSignOut}>
                <button className="text-bone/50 hover:text-bone">Sign out</button>
              </form>
            </div>
          </div>
        </nav>
      )}
    </div>
  );
}
