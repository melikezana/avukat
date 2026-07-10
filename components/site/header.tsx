"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Scale, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const navigation = [
  { href: "/", label: "Ana Sayfa" },
  { href: "/hakkimda", label: "Hakkımda" },
  { href: "/uzmanlik-alanlari", label: "Uzmanlık Alanları" },
  { href: "/makaleler", label: "Makaleler" },
  { href: "/iletisim", label: "İletişim" }
];

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-navy-900/10 bg-cream-50/92 backdrop-blur">
      <div className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between px-5 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3" onClick={() => setOpen(false)}>
          <span className="flex h-10 w-10 items-center justify-center rounded-[6px] bg-navy-900 text-gold-500">
            <Scale className="h-5 w-5" aria-hidden />
          </span>
          <span>
            <span className="block font-serif text-xl font-bold leading-none text-navy-900">Av. İdris Dağkesen</span>
            <span className="mt-1 block text-xs text-ink/62">Kurumsal Avukat & Hukuk Yazarı</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-8 lg:flex" aria-label="Ana menü">
          {navigation.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-sm font-medium text-ink/72 transition hover:text-gold-600",
                  isActive && "text-navy-900"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <Link
          href="/iletisim"
          className="hidden rounded-[6px] bg-navy-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-navy-800 lg:inline-flex"
        >
          Randevu Talebi
        </Link>

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-[6px] border border-navy-900/10 text-navy-900 lg:hidden"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-label={open ? "Menüyü kapat" : "Menüyü aç"}
        >
          {open ? <X className="h-5 w-5" aria-hidden /> : <Menu className="h-5 w-5" aria-hidden />}
        </button>
      </div>

      {open ? (
        <div className="border-t border-navy-900/10 bg-cream-50 px-5 py-4 lg:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col gap-1" aria-label="Mobil menü">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-[6px] px-3 py-3 text-sm font-semibold text-navy-900 transition hover:bg-white"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      ) : null}
    </header>
  );
}
