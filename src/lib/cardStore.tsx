import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

export type CardType = "debit" | "credit";
export type CardNetwork = "visa" | "mastercard" | "napas";

export interface BankCardData {
  id: string;
  parentId: string | null;
  type: CardType;
  network: CardNetwork;
  holder: string;
  number: string;
  expiry: string;
  locked: boolean;
  pin: string;
  creditLimit?: number;
}

interface CardContextValue {
  cards: BankCardData[];
  toggleLock: (id: string) => void;
  changePin: (id: string, newPin: string) => void;
  addSubCard: (parentId: string, holder: string) => void;
  removeCard: (id: string) => void;
}

const CardContext = createContext<CardContextValue | null>(null);

let idCounter = 0;
function nextId(prefix: string) {
  idCounter += 1;
  return `${prefix}-${Date.now()}-${idCounter}`;
}

function randomCardNumber(): string {
  const groups = Array.from({ length: 4 }, () => Math.floor(1000 + Math.random() * 9000));
  return groups.join(" ");
}

const SEED_CARDS: BankCardData[] = [
  {
    id: "card-1",
    parentId: null,
    type: "debit",
    network: "napas",
    holder: "Nguyễn Văn An",
    number: "1903 8888 1234 5601",
    expiry: "12/28",
    locked: false,
    pin: "1234",
  },
  {
    id: "card-2",
    parentId: null,
    type: "credit",
    network: "visa",
    holder: "Nguyễn Văn An",
    number: "4532 1187 9924 6610",
    expiry: "09/27",
    locked: false,
    pin: "5678",
    creditLimit: 50000000,
  },
  {
    id: "card-3",
    parentId: "card-1",
    type: "debit",
    network: "napas",
    holder: "Nguyễn Thị Bình",
    number: "1903 8888 1234 7723",
    expiry: "12/28",
    locked: true,
    pin: "4321",
  },
];

export function CardProvider({ children }: { children: ReactNode }) {
  const [cards, setCards] = useState<BankCardData[]>(SEED_CARDS);

  const value = useMemo<CardContextValue>(
    () => ({
      cards,
      toggleLock: (id) => {
        setCards((prev) => prev.map((c) => (c.id === id ? { ...c, locked: !c.locked } : c)));
      },
      changePin: (id, newPin) => {
        setCards((prev) => prev.map((c) => (c.id === id ? { ...c, pin: newPin } : c)));
      },
      addSubCard: (parentId, holder) => {
        const parent = cards.find((c) => c.id === parentId);
        if (!parent) return;
        const subCard: BankCardData = {
          id: nextId("card"),
          parentId,
          type: parent.type,
          network: parent.network,
          holder,
          number: randomCardNumber(),
          expiry: parent.expiry,
          locked: false,
          pin: "0000",
        };
        setCards((prev) => [...prev, subCard]);
      },
      removeCard: (id) => {
        setCards((prev) => prev.filter((c) => c.id !== id && c.parentId !== id));
      },
    }),
    [cards]
  );

  return <CardContext.Provider value={value}>{children}</CardContext.Provider>;
}

export function useCards() {
  const ctx = useContext(CardContext);
  if (!ctx) throw new Error("useCards must be used within CardProvider");
  return ctx;
}
