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

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b bg-background/90 backdrop-blur-xl transition-shadow duration-300",
        scrolled ? "border-primary/10 shadow-[0_12px_34px_rgba(10,22,40,0.08)]" : "border-primary/5"
      )}
    >
      <div className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between px-5 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3" onClick={() => setOpen(false)}>
          <span className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border border-accent-2/50 bg-primary">
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
            <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent-1 text-white ring-2 ring-background">
              <Scale className="h-3 w-3" aria-hidden />
            </span>
          </span>
          <span>
            <span className="block font-serif text-xl font-bold leading-none text-primary">{lawyerProfile.name}</span>
            <span className="mt-1 block text-xs text-muted">{lawyerProfile.shortTitle}</span>
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
                  "relative text-sm font-medium text-muted transition hover:text-accent-1",
                  isActive &&
                    "text-accent-1 after:absolute after:-bottom-2 after:left-0 after:h-px after:w-full after:bg-accent-1"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <Link
          href="/iletisim"
          className="hidden rounded-[6px] bg-accent-1 px-4 py-2.5 text-sm font-semibold text-white transition duration-300 hover:bg-accent-2 hover:text-primary lg:inline-flex"
        >
          İletişime Geç
        </Link>

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-[6px] border border-primary/10 text-primary transition hover:border-accent-1 hover:text-accent-1 lg:hidden"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-label={open ? "Menüyü kapat" : "Menüyü aç"}
        >
          {open ? <X className="h-5 w-5" aria-hidden /> : <Menu className="h-5 w-5" aria-hidden />}
        </button>
      </div>

      {open ? (
        <div className="border-t border-primary/10 bg-background px-5 py-4 shadow-[0_18px_36px_rgba(10,22,40,0.08)] lg:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col gap-1" aria-label="Mobil menü">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-[6px] px-3 py-3 text-sm font-semibold text-primary transition hover:bg-white hover:text-accent-1"
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
