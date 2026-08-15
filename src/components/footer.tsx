import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-ink/10 bg-ink text-bone">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-4">
          <div>
            <p className="font-display text-lg font-semibold">
              ADONISMOB<span className="text-gold">15TH</span>
            </p>
            <p className="mt-3 max-w-xs text-sm text-bone/60">
              Modern clothing rooted in African identity. Designed deliberately,
              produced with intent.
            </p>
          </div>

          <div>
            <p className="text-sm font-semibold text-bone/90">Shop</p>
            <ul className="mt-3 space-y-2 text-sm text-bone/60">
              <li><Link href="/shop" className="hover:text-bone">All Products</Link></li>
              <li><Link href="/collections" className="hover:text-bone">Collections</Link></li>
              <li><Link href="/custom-orders" className="hover:text-bone">Custom Orders</Link></li>
              <li><Link href="/members" className="hover:text-bone">Members Collection</Link></li>
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold text-bone/90">Company</p>
            <ul className="mt-3 space-y-2 text-sm text-bone/60">
              <li><Link href="/about" className="hover:text-bone">About</Link></li>
              <li><Link href="/contact" className="hover:text-bone">Contact</Link></li>
              <li><Link href="/account/orders" className="hover:text-bone">Track Order</Link></li>
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold text-bone/90">Get in touch</p>
            <ul className="mt-3 space-y-2 text-sm text-bone/60">
              <li>hello@adonismob15th.com</li>
              <li>Lagos, Nigeria</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-bone/10 pt-6 text-xs text-bone/40 sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {new Date().getFullYear()} ADONISMOB15TH. All rights reserved.</p>
          <p>Built for the culture.</p>
        </div>
      </div>
    </footer>
  );
}
