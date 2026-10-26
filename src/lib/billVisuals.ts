import { Zap, Droplets, Wifi, Tv, Smartphone, Receipt, type LucideIcon } from "lucide-react";
import type { BillCategory } from "./billStore.tsx";

export const BILL_CATEGORY_LABELS: Record<BillCategory, string> = {
  electric: "Điện",
  water: "Nước",
  internet: "Internet",
  tv: "Truyền hình",
  phone: "Di động",
  other: "Khác",
};

export const BILL_CATEGORY_ICONS: Record<BillCategory, LucideIcon> = {
  electric: Zap,
  water: Droplets,
  internet: Wifi,
  tv: Tv,
  phone: Smartphone,
  other: Receipt,
};

export const BILL_CATEGORY_COLORS: Record<BillCategory, { bg: string; text: string }> = {
  electric: { bg: "bg-amber-50", text: "text-amber-600" },
  water: { bg: "bg-sky-50", text: "text-sky-600" },
  internet: { bg: "bg-indigo-50", text: "text-indigo-600" },
  tv: { bg: "bg-fuchsia-50", text: "text-fuchsia-600" },
  phone: { bg: "bg-emerald-50", text: "text-emerald-600" },
  other: { bg: "bg-slate-100", text: "text-slate-600" },
};

export const BILL_CATEGORY_KEYS: BillCategory[] = ["electric", "water", "internet", "tv", "phone", "other"];

export function daysUntil(dateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dateStr);
  due.setHours(0, 0, 0, 0);
  return Math.round((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export function dueLabel(dateStr: string): string {
  const diff = daysUntil(dateStr);
  if (diff < 0) return `Quá hạn ${Math.abs(diff)} ngày`;
  if (diff === 0) return "Đến hạn hôm nay";
  return `Còn ${diff} ngày`;
}
