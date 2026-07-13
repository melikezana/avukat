import Image from "next/image";
import {
  BriefcaseBusiness,
  Building2,
  HeartHandshake,
  Home,
  Landmark,
  Scale,
  ShieldCheck,
  type LucideIcon
} from "lucide-react";
import { cn } from "@/lib/utils";

type ArticleCoverProps = {
  src?: string;
  title: string;
  category: string;
  width?: number;
  height?: number;
  sizes: string;
  className?: string;
  imageClassName?: string;
};

type CoverStyle = {
  icon: LucideIcon;
  gradient: string;
  ring: string;
};

const coverStyles: { keywords: string[]; style: CoverStyle }[] = [
  {
    keywords: ["Kira", "Gayrimenkul"],
    style: {
      icon: Home,
      gradient: "from-[#7A1F2B] via-[#0A1628] to-[#8B6A2F]",
      ring: "border-[#CFAE77]/45 bg-[#FAF7F1]/10"
    }
  },
  {
    keywords: ["İş", "Is"],
    style: {
      icon: BriefcaseBusiness,
      gradient: "from-[#0A1628] via-[#7A1F2B] to-[#8B6A2F]",
      ring: "border-[#FAF7F1]/30 bg-[#CFAE77]/10"
    }
  },
  {
    keywords: ["Aile", "Boşanma", "Bosanma"],
    style: {
      icon: HeartHandshake,
      gradient: "from-[#7A1F2B] via-[#5C5854] to-[#0A1628]",
      ring: "border-[#CFAE77]/45 bg-[#FAF7F1]/10"
    }
  },
  {
    keywords: ["Ceza"],
    style: {
      icon: ShieldCheck,
      gradient: "from-[#0A1628] via-[#5C5854] to-[#7A1F2B]",
      ring: "border-[#CFAE77]/40 bg-[#FAF7F1]/10"
    }
  },
  {
    keywords: ["Ticaret", "Şirket", "Sirket"],
    style: {
      icon: Building2,
      gradient: "from-[#07111F] via-[#7A1F2B] to-[#8B6A2F]",
      ring: "border-[#CFAE77]/40 bg-[#FAF7F1]/10"
    }
  },
  {
    keywords: ["Genel"],
    style: {
      icon: Scale,
      gradient: "from-[#FAF7F1] via-[#8B6A2F] to-[#0A1628]",
      ring: "border-[#0A1628]/20 bg-white/20"
    }
  }
];

const defaultCoverStyle: CoverStyle = {
  icon: Landmark,
  gradient: "from-[#0A1628] via-[#7A1F2B] to-[#8B6A2F]",
  ring: "border-[#CFAE77]/40 bg-[#FAF7F1]/10"
};

function getCoverStyle(category: string) {
  return (
    coverStyles.find(({ keywords }) => keywords.some((keyword) => category.includes(keyword)))?.style ??
    defaultCoverStyle
  );
}

export function ArticleCover({
  src,
  title,
  category,
  width = 800,
  height = 450,
  sizes,
  className,
  imageClassName
}: ArticleCoverProps) {
  const coverStyle = getCoverStyle(category);
  const Icon = coverStyle.icon;
  const baseClassName = cn("aspect-[16/9] w-full", className);

  if (src) {
    return (
      <Image
        src={src}
        alt={`${title} kapak görseli`}
        width={width}
        height={height}
        sizes={sizes}
        className={cn(baseClassName, "object-cover", imageClassName)}
      />
    );
  }

  return (
    <div
      className={cn(
        baseClassName,
        "relative flex items-center justify-center overflow-hidden bg-primary p-8 text-white",
        imageClassName
      )}
    >
      <div className={cn("absolute inset-0 bg-gradient-to-br", coverStyle.gradient)} aria-hidden />
      <div className="absolute inset-x-10 top-10 h-px bg-accent-2/35" aria-hidden />
      <div className="absolute inset-x-10 bottom-10 h-px bg-white/20" aria-hidden />
      <div className="relative flex flex-col items-center gap-4 text-center">
        <span
          className={cn(
            "flex h-20 w-20 items-center justify-center rounded-full border backdrop-blur-sm",
            coverStyle.ring
          )}
        >
          <Icon className="h-9 w-9 text-[#FAF7F1]" strokeWidth={1.5} aria-hidden />
        </span>
        <span className="border-t border-[#CFAE77]/50 pt-3 text-sm font-semibold text-[#FAF7F1]">
          {category}
        </span>
      </div>
    </div>
  );
}
