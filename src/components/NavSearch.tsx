import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  ArrowDownLeft,
  ArrowUpRight,
  LayoutDashboard,
  ArrowLeftRight,
  History,
  type LucideIcon,
} from "lucide-react";
import { mockContacts, mockTransactions, formatVND, type Contact, type Transaction } from "../lib/mockData.ts";

interface NavPage {
  to: string;
  label: string;
  icon: LucideIcon;
}

const pages: NavPage[] = [
  { to: "/dashboard", label: "Tổng quan", icon: LayoutDashboard },
  { to: "/transfer", label: "Chuyển khoản", icon: ArrowLeftRight },
  { to: "/history", label: "Lịch sử giao dịch", icon: History },
];

export default function NavSearch() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [dropHeight, setDropHeight] = useState(0);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const q = query.trim().toLowerCase();

  const matchedPages: NavPage[] = q ? pages.filter((p) => p.label.toLowerCase().includes(q)) : pages;

  const matchedContacts: Contact[] = q
    ? mockContacts.filter((c) => c.name.toLowerCase().includes(q) || c.bank.toLowerCase().includes(q))
    : mockContacts.slice(0, 3);

  const matchedTransactions: Transaction[] = q
    ? mockTransactions.filter((t) => t.desc.toLowerCase().includes(q))
    : mockTransactions.slice(0, 3);

  const hasResults = matchedPages.length + matchedContacts.length + matchedTransactions.length > 0;

  useLayoutEffect(() => {
    if (open && contentRef.current) {
      setDropHeight(contentRef.current.scrollHeight);
    } else if (!open) {
      setDropHeight(0);
    }
  }, [open, q, hasResults]);

  function go(to: string) {
    navigate(to);
    setOpen(false);
    setQuery("");
  }

  return (
    <div ref={wrapRef} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden md:block">
      <div
        className={`relative flex items-center rounded-full transition-all duration-300 ease-out ${
          open
            ? "w-[288px] bg-white shadow-[0_8px_24px_rgba(0,0,0,0.12)] ring-1 ring-slate-900/10"
            : "w-[216px] bg-black/[0.04] ring-1 ring-transparent"
        }`}
      >
        <Search size={10} className={`absolute left-[10px] transition-colors duration-300 ${open ? "text-slate-900" : "text-slate-400"}`} />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setOpen(true)}
          placeholder="Tìm kiếm giao dịch, tính năng..."
          className="w-full pl-[27px] pr-[36px] py-[4px] rounded-full bg-transparent border-0 text-[11px] text-slate-700 placeholder:text-slate-400 focus:outline-none"
        />
        <kbd
          className={`absolute right-[8px] flex items-center gap-[2px] px-[4px] py-[2px] rounded-md bg-white/80 text-[9px] font-medium text-slate-400 border border-black/5 transition-all duration-200 ${
            open ? "opacity-0 scale-90" : "opacity-100 scale-100"
          }`}
        >
          ⌘K
        </kbd>
      </div>

      <div
        className="absolute top-[calc(100%+8px)] left-1/2 -translate-x-1/2 w-[288px] rounded-2xl bg-white shadow-[0_16px_40px_rgba(0,0,0,0.16)] border border-black/5 overflow-hidden transition-[max-height,opacity] duration-500"
        style={{
          maxHeight: Math.min(dropHeight, window.innerHeight * 0.7),
          opacity: open ? 1 : 0,
          transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
          pointerEvents: open ? "auto" : "none",
        }}
      >
        <div ref={contentRef} className="p-[6px] max-h-[70vh] overflow-y-auto">
          {!hasResults && (
            <p className="px-[9px] py-[18px] text-center text-[11px] text-slate-400">Không tìm thấy kết quả nào.</p>
          )}

          {matchedPages.length > 0 && (
            <div className="mb-[3px]">
              <p className="px-[9px] pt-[6px] pb-[3px] text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Điều hướng
              </p>
              {matchedPages.map(({ to, label, icon: Icon }) => (
                <button
                  key={to}
                  onClick={() => go(to)}
                  className="w-full flex items-center gap-[9px] px-[9px] py-[6px] rounded-xl text-left text-[11px] font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <span className="w-[24px] h-[24px] rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                    <Icon size={11} />
                  </span>
                  {label}
                </button>
              ))}
            </div>
          )}

          {matchedContacts.length > 0 && (
            <div className="mb-[3px]">
              <p className="px-[9px] pt-[6px] pb-[3px] text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Người nhận
              </p>
              {matchedContacts.map((c) => (
                <button
                  key={c.id}
                  onClick={() => go("/transfer")}
                  className="w-full flex items-center gap-[9px] px-[9px] py-[6px] rounded-xl text-left hover:bg-slate-50 transition-colors"
                >
                  <span className="w-[24px] h-[24px] rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-semibold text-slate-600">
                    {c.name.split(" ").pop()?.[0]}
                  </span>
                  <span className="min-w-0 flex-1">
                    <p className="text-[11px] font-medium text-slate-900 truncate">{c.name}</p>
                    <p className="text-[10px] text-slate-400">{c.bank}</p>
                  </span>
                </button>
              ))}
            </div>
          )}

          {matchedTransactions.length > 0 && (
            <div>
              <p className="px-[9px] pt-[6px] pb-[3px] text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Giao dịch
              </p>
              {matchedTransactions.map((tx) => (
                <button
                  key={tx.id}
                  onClick={() => go("/history")}
                  className="w-full flex items-center gap-[9px] px-[9px] py-[6px] rounded-xl text-left hover:bg-slate-50 transition-colors"
                >
                  <span
                    className={`w-[24px] h-[24px] rounded-full flex items-center justify-center ${
                      tx.type === "in" ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {tx.type === "in" ? <ArrowDownLeft size={11} /> : <ArrowUpRight size={11} />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <p className="text-[11px] font-medium text-slate-900 truncate">{tx.desc}</p>
                    <p className="text-[10px] text-slate-400">{tx.date}</p>
                  </span>
                  <span
                    className={`text-[11px] font-semibold ${tx.type === "in" ? "text-emerald-600" : "text-slate-900"}`}
                  >
                    {tx.type === "in" ? "+" : "-"}
                    {formatVND(tx.amount)}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
