import { cn } from "@/lib/utils";

type ActionButtonVariant = "whatsapp" | "secondary";

const actionButtonBaseClassName =
  "inline-flex min-h-11 w-full min-w-0 items-center justify-center gap-2 rounded-[6px] border px-4 py-2 text-center text-sm font-semibold no-underline transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 whitespace-normal break-normal [hyphens:none] [overflow-wrap:normal]";

const actionButtonVariants: Record<ActionButtonVariant, string> = {
  whatsapp:
    "border-navy-900 bg-navy-900 text-white shadow-[0_12px_28px_rgba(10,22,40,0.16)] hover:border-navy-800 hover:bg-navy-800 focus-visible:outline-gold-500",
  secondary:
    "border-primary/70 bg-white text-primary hover:border-navy-800 hover:bg-cream-100/70 hover:text-primary focus-visible:outline-gold-500"
};

const iconButtonBaseClassName =
  "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[6px] border transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2";

const iconButtonVariants: Record<ActionButtonVariant, string> = {
  whatsapp: "border-navy-900 bg-navy-900 text-white hover:border-navy-800 hover:bg-navy-800 focus-visible:outline-gold-500",
  secondary: "border-primary/20 bg-white text-primary hover:border-navy-800 hover:bg-cream-100/70 focus-visible:outline-gold-500"
};

export const whatsappIconClassName = "h-4 w-4 shrink-0 text-green-500";

export function getActionButtonClassName(variant: ActionButtonVariant, className?: string) {
  return cn(actionButtonBaseClassName, actionButtonVariants[variant], className);
}

export function getIconActionButtonClassName(variant: ActionButtonVariant, className?: string) {
  return cn(iconButtonBaseClassName, iconButtonVariants[variant], className);
}
