import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { FileText, LayoutDashboard, UploadCloud } from "lucide-react";
import { LogoutButton } from "@/components/admin/logout-button";

export const metadata: Metadata = {
  title: {
    default: "Yönetim Paneli",
    template: "%s | Yönetim Paneli"
  }
};

const adminNavigation = [
  { href: "/admin", label: "Panel", icon: LayoutDashboard },
  { href: "/admin/makaleler", label: "Makaleler", icon: FileText },
  { href: "/admin/yuklemeler", label: "Yüklemeler", icon: UploadCloud }
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--color-cream)] text-[var(--color-navy)]">
      <div className="grid min-h-screen lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="border-b border-[#d8c7a8] bg-[var(--color-navy-deep)] text-white lg:border-b-0 lg:border-r lg:border-[#c8a45d]/25">
          <div className="flex h-16 items-center border-b border-[#c8a45d]/20 px-5">
            <p className="text-base font-bold">Yönetim Paneli</p>
          </div>
          <nav className="flex gap-2 overflow-x-auto p-3 lg:flex-col lg:overflow-visible" aria-label="Yönetim menüsü">
            {adminNavigation.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="inline-flex min-h-11 items-center gap-3 rounded-[6px] px-3 py-2 text-sm font-semibold text-white/75 transition hover:bg-[#c8a45d]/15 hover:text-white"
                >
                  <Icon className="h-4 w-4" aria-hidden />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>
        <div className="min-w-0">
          <header className="flex min-h-16 flex-col justify-between gap-3 border-b border-[#d8c7a8] bg-[#fffaf0] px-5 py-3 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm font-semibold text-[var(--color-gold)]">Güvenli oturum</p>
              <h1 className="text-xl font-bold tracking-normal text-[var(--color-navy)]">İçerik Yönetimi</h1>
            </div>
            <LogoutButton />
          </header>
          <div className="p-5 lg:p-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
