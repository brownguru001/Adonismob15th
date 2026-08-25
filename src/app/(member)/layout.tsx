import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { RoseBackground } from "@/components/RoseBackground";
import { requireMember } from "@/lib/authz";

// Single server-side enforcement point for the entire private member area.
// Every route under (member) — including everything client-side navigation
// could reach — is gated here, before any page component runs.
export default async function MemberLayout({ children }: { children: React.ReactNode }) {
  await requireMember();

  return (
    <>
      <RoseBackground />
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
