import {
  Utensils,
  ShoppingBag,
  Receipt,
  Car,
  Wallet,
  Home,
  Gift,
  Smartphone,
  HeartPulse,
  MoreHorizontal,
  type LucideIcon,
} from "lucide-react";

export const CATEGORY_ICONS: Record<string, LucideIcon> = {
  utensils: Utensils,
  "shopping-bag": ShoppingBag,
  receipt: Receipt,
  car: Car,
  wallet: Wallet,
  home: Home,
  gift: Gift,
  smartphone: Smartphone,
  health: HeartPulse,
  other: MoreHorizontal,
};

export const CATEGORY_ICON_KEYS = Object.keys(CATEGORY_ICONS);

interface ColorSwatch {
  bg: string;
  text: string;
  dot: string;
  ring: string;
}

export const CATEGORY_COLORS: Record<string, ColorSwatch> = {
  amber: { bg: "bg-amber-50", text: "text-amber-600", dot: "bg-amber-500", ring: "ring-amber-500" },
  fuchsia: { bg: "bg-fuchsia-50", text: "text-fuchsia-600", dot: "bg-fuchsia-500", ring: "ring-fuchsia-500" },
  sky: { bg: "bg-sky-50", text: "text-sky-600", dot: "bg-sky-500", ring: "ring-sky-500" },
  emerald: { bg: "bg-emerald-50", text: "text-emerald-600", dot: "bg-emerald-500", ring: "ring-emerald-500" },
  teal: { bg: "bg-teal-50", text: "text-teal-600", dot: "bg-teal-500", ring: "ring-teal-500" },
  indigo: { bg: "bg-indigo-50", text: "text-indigo-600", dot: "bg-indigo-500", ring: "ring-indigo-500" },
  rose: { bg: "bg-rose-50", text: "text-rose-600", dot: "bg-rose-500", ring: "ring-rose-500" },
  slate: { bg: "bg-slate-100", text: "text-slate-600", dot: "bg-slate-500", ring: "ring-slate-500" },
};

export const CATEGORY_COLOR_KEYS = Object.keys(CATEGORY_COLORS);

export function categoryColor(color: string): ColorSwatch {
  return CATEGORY_COLORS[color] ?? CATEGORY_COLORS.slate;
}

export function categoryIcon(icon: string): LucideIcon {
  return CATEGORY_ICONS[icon] ?? CATEGORY_ICONS.other;
}
