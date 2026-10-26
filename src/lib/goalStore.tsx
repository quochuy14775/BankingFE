import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

export interface FinancialGoal {
  id: string;
  name: string;
  current: number;
  target: number;
  deadline?: string;
}

interface GoalContextValue {
  goals: FinancialGoal[];
  addGoal: (input: Omit<FinancialGoal, "id" | "current">) => void;
  removeGoal: (id: string) => void;
  deposit: (id: string, amount: number) => void;
  updateGoal: (id: string, input: Pick<FinancialGoal, "name" | "target" | "deadline">) => void;
}

const GoalContext = createContext<GoalContextValue | null>(null);

let idCounter = 0;
function nextId() {
  idCounter += 1;
  return `goal-${Date.now()}-${idCounter}`;
}

const SEED_GOALS: FinancialGoal[] = [
  { id: "g1", name: "Du lịch Nhật Bản", current: 22500000, target: 50000000, deadline: "2026-12-01" },
  { id: "g2", name: "Mua xe ô tô", current: 390000000, target: 600000000, deadline: "2027-06-01" },
];

export function GoalProvider({ children }: { children: ReactNode }) {
  const [goals, setGoals] = useState<FinancialGoal[]>(SEED_GOALS);

  const value = useMemo<GoalContextValue>(
    () => ({
      goals,
      addGoal: (input) => {
        setGoals((prev) => [...prev, { ...input, id: nextId(), current: 0 }]);
      },
      removeGoal: (id) => {
        setGoals((prev) => prev.filter((g) => g.id !== id));
      },
      deposit: (id, amount) => {
        setGoals((prev) =>
          prev.map((g) => (g.id === id ? { ...g, current: Math.min(g.current + amount, g.target) } : g))
        );
      },
      updateGoal: (id, input) => {
        setGoals((prev) => prev.map((g) => (g.id === id ? { ...g, ...input } : g)));
      },
    }),
    [goals]
  );

  return <GoalContext.Provider value={value}>{children}</GoalContext.Provider>;
}

export function useGoals() {
  const ctx = useContext(GoalContext);
  if (!ctx) throw new Error("useGoals must be used within GoalProvider");
  return ctx;
}
