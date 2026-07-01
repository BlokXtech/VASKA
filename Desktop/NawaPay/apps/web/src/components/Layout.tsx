import { Activity, Banknote, FileText, Mail, ShieldCheck, Users, WalletCards } from "lucide-react";
import type { ReactNode } from "react";
import { Footer } from "./Footer";

interface LayoutProps {
  children: ReactNode;
}

const links = [
  { href: "/", label: "Overview", icon: Activity },
  { href: "/#wallets", label: "Wallets", icon: WalletCards },
  { href: "/#payments", label: "Pay Bills", icon: Banknote },
  { href: "/#compliance", label: "Compliance", icon: ShieldCheck },
  { href: "/about", label: "About", icon: Users },
  { href: "/privacy", label: "Privacy", icon: FileText },
  { href: "/contact", label: "Contact", icon: Mail }
];

export function Layout({ children }: LayoutProps) {
  const path = window.location.pathname;

  return (
    <main className="shell">
      <aside className="sidebar">
        <a className="brand" href="/">
          <div className="brand-mark">N</div>
          <div>
            <strong>NAWAPAY</strong>
            <span>Payment middleman</span>
          </div>
        </a>
        <nav>
          {links.map((link) => {
            const Icon = link.icon;
            const active = link.href === "/" ? path === "/" : path === link.href;
            return (
              <a className={active ? "active" : undefined} href={link.href} key={link.href}>
                <Icon size={18} /> {link.label}
              </a>
            );
          })}
        </nav>
      </aside>

      <section className="workspace">
        {children}
        <Footer />
      </section>
    </main>
  );
}
