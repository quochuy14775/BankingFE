import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

export type BillCategory = "electric" | "water" | "internet" | "tv" | "phone" | "other";

export interface BillProvider {
  id: string;
  name: string;
  category: BillCategory;
  customerCode: string;
  amount: number;
  dueDate: string;
  autopay: boolean;
}

export interface BillPayment {
  id: string;
  providerId: string;
  providerName: string;
  amount: number;
  date: string;
  method: "manual" | "auto";
}

interface BillContextValue {
  providers: BillProvider[];
  payments: BillPayment[];
  addProvider: (input: Omit<BillProvider, "id" | "autopay">) => void;
  removeProvider: (id: string) => void;
  toggleAutopay: (id: string) => void;
  payBill: (id: string) => BillPayment | undefined;
}

const BillContext = createContext<BillContextValue | null>(null);

let idCounter = 0;
function nextId(prefix: string) {
  idCounter += 1;
  return `${prefix}-${Date.now()}-${idCounter}`;
}

function nextCycleDate(dateStr: string): string {
  const d = new Date(dateStr);
  d.setMonth(d.getMonth() + 1);
  return d.toISOString().slice(0, 10);
}

const SEED_PROVIDERS: BillProvider[] = [
  { id: "bp-1", name: "Điện lực EVN", category: "electric", customerCode: "PE04008812", amount: 620000, dueDate: "2026-08-04", autopay: true },
  { id: "bp-2", name: "Nước sạch Sawaco", category: "water", customerCode: "W1102938", amount: 185000, dueDate: "2026-08-06", autopay: false },
  { id: "bp-3", name: "Internet FPT", category: "internet", customerCode: "FPT88213", amount: 250000, dueDate: "2026-08-03", autopay: true },
  { id: "bp-4", name: "Truyền hình K+", category: "tv", customerCode: "KP553201", amount: 165000, dueDate: "2026-08-10", autopay: false },
  { id: "bp-5", name: "Di động Viettel", category: "phone", customerCode: "0912345678", amount: 120000, dueDate: "2026-08-08", autopay: false },
];

const SEED_PAYMENTS: BillPayment[] = [
  { id: "bh-1", providerId: "bp-1", providerName: "Điện lực EVN", amount: 598000, date: "2026-07-04", method: "auto" },
  { id: "bh-2", providerId: "bp-3", providerName: "Internet FPT", amount: 250000, date: "2026-07-03", method: "auto" },
  { id: "bh-3", providerId: "bp-5", providerName: "Di động Viettel", amount: 100000, date: "2026-07-08", method: "manual" },
];

export function BillsProvider({ children }: { children: ReactNode }) {
  const [providers, setProviders] = useState<BillProvider[]>(SEED_PROVIDERS);
  const [payments, setPayments] = useState<BillPayment[]>(SEED_PAYMENTS);

  const value = useMemo<BillContextValue>(
    () => ({
      providers,
      payments,
      addProvider: (input) => {
        setProviders((prev) => [...prev, { ...input, id: nextId("bp"), autopay: false }]);
      },
      removeProvider: (id) => {
        setProviders((prev) => prev.filter((p) => p.id !== id));
      },
      toggleAutopay: (id) => {
        setProviders((prev) => prev.map((p) => (p.id === id ? { ...p, autopay: !p.autopay } : p)));
      },
      payBill: (id) => {
        const provider = providers.find((p) => p.id === id);
        if (!provider) return undefined;
        const payment: BillPayment = {
          id: nextId("bh"),
          providerId: provider.id,
          providerName: provider.name,
          amount: provider.amount,
          date: new Date().toISOString().slice(0, 10),
          method: "manual",
        };
        setPayments((prev) => [payment, ...prev]);
        setProviders((prev) =>
          prev.map((p) => (p.id === id ? { ...p, dueDate: nextCycleDate(p.dueDate) } : p))
        );
        return payment;
      },
    }),
    [providers, payments]
  );

  return <BillContext.Provider value={value}>{children}</BillContext.Provider>;
}

export function useBills() {
  const ctx = useContext(BillContext);
  if (!ctx) throw new Error("useBills must be used within BillProvider");
  return ctx;
}
