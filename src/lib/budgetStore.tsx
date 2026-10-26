import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { mockTransactions as seedTransactions, type Transaction } from "./mockData";

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
}

export interface CategorizedTransaction extends Transaction {
  categoryId?: string;
}

interface BudgetContextValue {
  categories: Category[];
  transactions: CategorizedTransaction[];
  budgetLimits: Record<string, number>;
  addCategory: (name: string, color: string, icon: string) => void;
  removeCategory: (id: string) => void;
  addTransaction: (tx: Omit<CategorizedTransaction, "id">) => void;
  setTransactionCategory: (txId: string, categoryId: string | undefined) => void;
  setBudgetLimit: (categoryId: string, amount: number | undefined) => void;
}

const BudgetContext = createContext<BudgetContextValue | null>(null);

export const DEFAULT_CATEGORIES: Category[] = [
  { id: "cat-food", name: "Ăn uống", color: "amber", icon: "utensils" },
  { id: "cat-shopping", name: "Mua sắm", color: "fuchsia", icon: "shopping-bag" },
  { id: "cat-bill", name: "Hóa đơn", color: "sky", icon: "receipt" },
  { id: "cat-transport", name: "Di chuyển", color: "emerald", icon: "car" },
  { id: "cat-income", name: "Thu nhập", color: "teal", icon: "wallet" },
];

const SEED_CATEGORY_MAP: Record<string, string> = {
  t1: "cat-shopping",
  t2: "cat-income",
  t3: "cat-bill",
  t4: "cat-shopping",
  t5: "cat-shopping",
  t6: "cat-bill",
};

let idCounter = 0;
function nextId(prefix: string) {
  idCounter += 1;
  return `${prefix}-${Date.now()}-${idCounter}`;
}

export function BudgetProvider({ children }: { children: ReactNode }) {
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [transactions, setTransactions] = useState<CategorizedTransaction[]>(() =>
    seedTransactions.map((t) => ({ ...t, categoryId: SEED_CATEGORY_MAP[t.id] }))
  );
  const [budgetLimits, setBudgetLimits] = useState<Record<string, number>>({});

  const value = useMemo<BudgetContextValue>(
    () => ({
      categories,
      transactions,
      budgetLimits,
      addCategory: (name, color, icon) => {
        setCategories((prev) => [...prev, { id: nextId("cat"), name, color, icon }]);
      },
      removeCategory: (id) => {
        setCategories((prev) => prev.filter((c) => c.id !== id));
        setTransactions((prev) => prev.map((t) => (t.categoryId === id ? { ...t, categoryId: undefined } : t)));
        setBudgetLimits((prev) => {
          const { [id]: _removed, ...rest } = prev;
          return rest;
        });
      },
      addTransaction: (tx) => {
        setTransactions((prev) => [{ ...tx, id: nextId("t") }, ...prev]);
      },
      setTransactionCategory: (txId, categoryId) => {
        setTransactions((prev) => prev.map((t) => (t.id === txId ? { ...t, categoryId } : t)));
      },
      setBudgetLimit: (categoryId, amount) => {
        setBudgetLimits((prev) => {
          if (amount === undefined || amount <= 0) {
            const { [categoryId]: _removed, ...rest } = prev;
            return rest;
          }
          return { ...prev, [categoryId]: amount };
        });
      },
    }),
    [categories, transactions, budgetLimits]
  );

  return <BudgetContext.Provider value={value}>{children}</BudgetContext.Provider>;
}

export function useBudget() {
  const ctx = useContext(BudgetContext);
  if (!ctx) throw new Error("useBudget must be used within BudgetProvider");
  return ctx;
}
