import {
  BriefcaseBusiness,
  Building2,
  Handshake,
  Home,
  KeyRound,
  Landmark,
  Scale,
  ShieldAlert,
  type LucideIcon
} from "lucide-react";
import { slugifyTurkish } from "@/lib/categories";
import { cn } from "@/lib/utils";

type CategoryVisualProps = {
  category: string;
  title?: string;
  className?: string;
};

type CategoryVisualStyle = {
  icon: LucideIcon;
  secondaryIcon?: LucideIcon;
  gradient: string;
  glow: string;
  label: string;
};

const categoryVisuals: Record<string, CategoryVisualStyle> = {
  "kira-hukuku": {
    icon: Home,
    secondaryIcon: KeyRound,
    gradient: "from-[#7A1F2B] via-[#0A1628] to-[#B8965A]",
    glow: "bg-[#B8965A]/20",
    label: "Kira Hukuku"
  },
  "is-hukuku": {
    icon: BriefcaseBusiness,
    gradient: "from-[#0A1628] via-[#7A1F2B] to-[#B8965A]",
    glow: "bg-[#FAF7F1]/20",
    label: "İş Hukuku"
  },
  "aile-hukuku": {
    icon: Landmark,
    gradient: "from-[#7A1F2B] via-[#5C5854] to-[#0A1628]",
    glow: "bg-[#B8965A]/20",
    label: "Aile Hukuku"
  },
  "ceza-hukuku": {
    icon: Scale,
    secondaryIcon: ShieldAlert,
    gradient: "from-[#07111F] via-[#0A1628] to-[#7A1F2B]",
    glow: "bg-[#B8965A]/20",
    label: "Ceza Hukuku"
  },
  "ticaret-hukuku": {
    icon: Handshake,
    gradient: "from-[#07111F] via-[#7A1F2B] to-[#B8965A]",
    glow: "bg-[#FAF7F1]/20",
    label: "Ticaret Hukuku"
  },
  "gayrimenkul-hukuku": {
    icon: Building2,
    gradient: "from-[#7A1F2B] via-[#0A1628] to-[#8B6A2F]",
    glow: "bg-[#B8965A]/20",
    label: "Gayrimenkul Hukuku"
  },
  "genel-hukuk": {
    icon: Scale,
    gradient: "from-[#0A1628] via-[#7A1F2B] to-[#8B6A2F]",
    glow: "bg-[#FAF7F1]/20",
    label: "Genel Hukuk"
  }
};

function getCategoryVisual(category: string) {
  const slug = slugifyTurkish(category);
  return categoryVisuals[slug] ?? categoryVisuals["genel-hukuk"];
}

function FamilyRings() {
  return (
    <span className="relative h-16 w-20" aria-hidden>
      <span className="absolute left-3 top-3 h-11 w-11 rounded-full border-2 border-[#FAF7F1]/90" />
      <span className="absolute right-3 top-3 h-11 w-11 rounded-full border-2 border-[#B8965A]/95" />
      <span className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#FAF7F1]" />
    </span>
  );
}

export function CategoryVisual({ category, title, className }: CategoryVisualProps) {
  const visual = getCategoryVisual(category);
  const Icon = visual.icon;
  const SecondaryIcon = visual.secondaryIcon;
  const visualSlug = slugifyTurkish(category);
  const patternId = `category-pattern-${visualSlug || "default"}`;
  const isFamily = visualSlug === "aile-hukuku";

  return (
    <div
      className={cn(
        "relative flex aspect-[16/10] min-h-36 w-full items-center justify-center overflow-hidden rounded-[8px] bg-primary p-6 text-white",
        className
      )}
      aria-label={title ? `${title} görseli` : `${visual.label} görseli`}
      role="img"
    >
      <div className={cn("absolute inset-0 bg-gradient-to-br", visual.gradient)} aria-hidden />
      <svg className="absolute inset-0 h-full w-full opacity-25" aria-hidden>
        <defs>
          <pattern id={patternId} width="34" height="34" patternUnits="userSpaceOnUse">
            <path d="M0 34 34 0M-8 8 8 -8M26 42 42 26" stroke="#FAF7F1" strokeWidth="0.7" opacity="0.42" />
            <circle cx="17" cy="17" r="1.3" fill="#B8965A" opacity="0.45" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${patternId})`} />
      </svg>
      <div className={cn("absolute -right-12 -top-12 h-40 w-40 rounded-full blur-3xl", visual.glow)} aria-hidden />
      <div className="absolute inset-x-8 top-8 h-px bg-[#FAF7F1]/25" aria-hidden />
      <div className="absolute inset-x-8 bottom-8 h-px bg-[#B8965A]/45" aria-hidden />
      <div className="relative flex flex-col items-center gap-4 text-center">
        <span className="relative flex h-24 w-24 items-center justify-center rounded-full border border-[#FAF7F1]/30 bg-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.18)] backdrop-blur-sm">
          {isFamily ? <FamilyRings /> : <Icon className="h-11 w-11 text-[#FAF7F1]" strokeWidth={1.45} aria-hidden />}
          {SecondaryIcon ? (
            <span className="absolute -bottom-1 -right-1 flex h-9 w-9 items-center justify-center rounded-full border border-[#B8965A]/70 bg-[#07111F]/85">
              <SecondaryIcon className="h-4 w-4 text-[#B8965A]" strokeWidth={1.7} aria-hidden />
            </span>
          ) : null}
        </span>
        <span className="card-title border-t border-[#B8965A]/60 pt-3 text-sm font-semibold uppercase text-[#FAF7F1]">
          {visual.label}
        </span>
      </div>
    </div>
  );
}
