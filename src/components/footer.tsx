export function Footer() {
  return (
    <footer className="border-t border-ink/10 py-6">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-1 px-4 text-center text-xs text-ink/40 sm:px-6 lg:px-8">
        <p>ADONISMOB15TH &middot; Private platform</p>
        <p>&copy; {new Date().getFullYear()}. Not for public distribution.</p>
      </div>
    </footer>
  );
}
