"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Scale, X } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { lawyerProfile, portraitBlurDataUrl } from "@/lib/site-profile";

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
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const updateScrolled = () => setScrolled(window.scrollY > 8);
    updateScrolled();
    window.addEventListener("scroll", updateScrolled, { passive: true });

    return () => window.removeEventListener("scroll", updateScrolled);
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("keydown", closeOnEscape);

    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [open]);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b bg-cream-50/95 backdrop-blur-xl transition-shadow duration-300",
        scrolled ? "border-gold-500/25 shadow-[0_12px_34px_rgba(10,22,40,0.08)]" : "border-primary/5"
      )}
    >
      <div className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between gap-5 px-5 sm:px-6 lg:px-8">
        <Link href="/" className="flex min-w-0 items-center gap-3" onClick={() => setOpen(false)}>
          <span className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full border border-gold-500/60 bg-primary">
            <Image
              src={lawyerProfile.portraitSrc}
              alt={lawyerProfile.portraitAlt}
              width={88}
              height={88}
              sizes="44px"
              placeholder="blur"
              blurDataURL={portraitBlurDataUrl}
              className="h-full w-full object-cover"
            />
            <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-gold-500 text-primary ring-2 ring-cream-50">
              <Scale className="h-3 w-3" aria-hidden />
            </span>
          </span>
          <span className="min-w-0">
            <span className="block font-serif text-xl font-bold leading-none text-primary">{lawyerProfile.name}</span>
            <span className="mt-1 block text-xs text-muted">{lawyerProfile.shortTitle}</span>
          </span>
        </Link>

        <nav
          className="hidden rounded-[8px] border border-primary/10 bg-white/70 px-2 py-1.5 shadow-[0_10px_28px_rgba(10,22,40,0.04)] xl:block"
          aria-label="Ana menü"
        >
          <ul className="flex items-center justify-center gap-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
              return (
                <li key={item.href} className="list-none">
                  <Link
                    href={item.href}
                    className={cn(
                      "relative inline-flex min-h-10 items-center whitespace-nowrap rounded-[6px] px-4 text-sm font-semibold text-muted transition hover:bg-cream-100/70 hover:text-primary",
                      isActive &&
                        "bg-primary text-white shadow-[0_10px_22px_rgba(10,22,40,0.12)] hover:bg-primary hover:text-white after:absolute after:-bottom-2 after:left-4 after:right-4 after:h-px after:bg-gold-500"
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <Link
          href="/iletisim"
          className="hidden shrink-0 rounded-[6px] bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-gold transition duration-300 hover:bg-gold-500 hover:text-primary xl:inline-flex"
        >
          İletişime Geç
        </Link>

        <button
          type="button"
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[6px] border border-primary/10 text-primary transition hover:border-gold-500 hover:text-primary xl:hidden"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls="mobile-navigation"
          aria-label={open ? "Menüyü kapat" : "Menüyü aç"}
        >
          {open ? <X className="h-5 w-5" aria-hidden /> : <Menu className="h-5 w-5" aria-hidden />}
        </button>
      </div>

      {open ? (
        <div
          id="mobile-navigation"
          className="border-t border-gold-500/20 bg-cream-50 px-5 py-4 shadow-[0_18px_36px_rgba(10,22,40,0.08)] xl:hidden"
        >
          <nav aria-label="Mobil menü">
            <ul className="mx-auto flex max-w-7xl flex-col gap-2">
              {navigation.map((item) => {
                const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
                return (
                  <li key={item.href} className="list-none">
                    <Link
                      href={item.href}
                      className={cn(
                        "block rounded-[6px] border border-primary/10 bg-white/70 px-3 py-3 text-sm font-semibold text-primary transition hover:border-gold-500/50 hover:bg-white",
                        isActive && "border-gold-500/50 bg-primary text-white hover:bg-primary hover:text-white"
                      )}
                      onClick={() => setOpen(false)}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
