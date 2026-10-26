import { useMemo, useState } from "react";
import { ArrowDownLeft, ArrowUpRight, Search, TrendingUp, TrendingDown, Receipt, List, GitCommitVertical, Tag } from "lucide-react";
import { formatVND } from "../lib/mockData.ts";
import { useBudget, type CategorizedTransaction } from "../lib/budgetStore.tsx";
import { categoryColor, categoryIcon } from "../lib/categoryVisuals.ts";

type Filter = "all" | "in" | "out";
type ViewMode = "list" | "timeline";
const UNCATEGORIZED = "uncategorized";

function formatGroupLabel(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("vi-VN", { weekday: "long", day: "2-digit", month: "long", year: "numeric" });
}

function CategoryBadge({ categoryId }: { categoryId?: string }) {
  const { categories } = useBudget();
  const cat = categories.find((c) => c.id === categoryId);
  if (!cat) {
    return (
      <span className="inline-flex items-center gap-[4px] px-[7px] py-[2px] rounded-full bg-slate-100 text-slate-400 text-[10px] font-medium">
        Chưa phân loại
      </span>
    );
  }
  const color = categoryColor(cat.color);
  const Icon = categoryIcon(cat.icon);
  return (
    <span
      className={`inline-flex items-center gap-[4px] px-[7px] py-[2px] rounded-full ${color.bg} ${color.text} text-[10px] font-medium`}
    >
      <Icon size={9} />
      {cat.name}
    </span>
  );
}

export default function History() {
  const { transactions, categories } = useBudget();
  const [filter, setFilter] = useState<Filter>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [query, setQuery] = useState("");
  const [view, setView] = useState<ViewMode>("list");
  const filtered = transactions.filter(
    (tx) =>
      (filter === "all" || tx.type === filter) &&
      (categoryFilter === "all" ||
        (categoryFilter === UNCATEGORIZED ? !tx.categoryId : tx.categoryId === categoryFilter)) &&
      tx.desc.toLowerCase().includes(query.trim().toLowerCase())
  );

  const totalIn = useMemo(
    () => transactions.filter((t) => t.type === "in").reduce((s, t) => s + t.amount, 0),
    [transactions]
  );
  const totalOut = useMemo(
    () => transactions.filter((t) => t.type === "out").reduce((s, t) => s + t.amount, 0),
    [transactions]
  );

  const groups = useMemo(() => {
    const map = new Map<string, CategorizedTransaction[]>();
    for (const tx of filtered) {
      const arr = map.get(tx.date) ?? [];
      arr.push(tx);
      map.set(tx.date, arr);
    }
    return Array.from(map.entries()).sort((a, b) => (a[0] < b[0] ? 1 : -1));
  }, [filtered]);

  return (
    <>
      <div className="pointer-events-none fixed top-[60px] left-1/5 w-[288px] h-[288px] rounded-full bg-indigo-200/15 blur-3xl -z-10 animate-ambient-pulse" />
      <div
        className="pointer-events-none fixed bottom-[30px] right-1/5 w-[288px] h-[288px] rounded-full bg-sky-200/15 blur-3xl -z-10 animate-ambient-pulse"
        style={{ animationDelay: "3s" }}
      />

      <h1 className="text-[22px] font-semibold text-slate-900 tracking-tight mb-[3px]">Lịch sử giao dịch</h1>
      <p className="text-slate-500 mb-[18px] text-[13px]">Toàn bộ giao dịch trên các tài khoản của bạn.</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-[12px] mb-[15px]">
        <div className="bg-white rounded-3xl border border-black/5 p-[15px] shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <div className="flex items-center gap-[8px] text-slate-400 mb-[8px]">
            <span className="w-[24px] h-[24px] rounded-full bg-slate-100 flex items-center justify-center">
              <Receipt size={11} />
            </span>
            <span className="text-[10px] font-medium uppercase tracking-wide">Tổng giao dịch</span>
          </div>
          <p className="text-[17px] font-semibold text-slate-900">{transactions.length}</p>
        </div>
        <div className="bg-white rounded-3xl border border-black/5 p-[15px] shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <div className="flex items-center gap-[8px] text-emerald-600 mb-[8px]">
            <span className="w-[24px] h-[24px] rounded-full bg-emerald-50 flex items-center justify-center">
              <TrendingUp size={11} />
            </span>
            <span className="text-[10px] font-medium uppercase tracking-wide">Tổng tiền vào</span>
          </div>
          <p className="text-[17px] font-semibold text-emerald-600">+{formatVND(totalIn)}</p>
        </div>
        <div className="bg-white rounded-3xl border border-black/5 p-[15px] shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <div className="flex items-center gap-[8px] text-slate-500 mb-[8px]">
            <span className="w-[24px] h-[24px] rounded-full bg-slate-100 flex items-center justify-center">
              <TrendingDown size={11} />
            </span>
            <span className="text-[10px] font-medium uppercase tracking-wide">Tổng tiền ra</span>
          </div>
          <p className="text-[17px] font-semibold text-slate-900">-{formatVND(totalOut)}</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-[10px] mb-[10px]">
        <div className="flex gap-[3px] bg-slate-100 rounded-full p-[3px] w-fit">
          {(
            [
              { key: "all", label: "Tất cả" },
              { key: "in", label: "Tiền vào" },
              { key: "out", label: "Tiền ra" },
            ] as { key: Filter; label: string }[]
          ).map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-[12px] py-[4px] rounded-full text-[11px] font-medium transition-all ${
                filter === f.key
                  ? "bg-white text-slate-900 shadow-[0_1px_3px_rgba(0,0,0,0.1)]"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="relative sm:ml-auto sm:w-[240px]">
          <Search size={12} className="absolute left-[12px] top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm giao dịch..."
            className="w-full pl-[30px] pr-[12px] py-[7px] rounded-full bg-slate-100 text-[12px] text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-slate-900/10 transition-all"
          />
        </div>

        <div className="flex gap-[3px] bg-slate-100 rounded-full p-[3px] w-fit">
          <button
            onClick={() => setView("list")}
            title="Danh sách"
            className={`flex items-center gap-[5px] px-[10px] py-[4px] rounded-full text-[11px] font-medium transition-all ${
              view === "list"
                ? "bg-white text-slate-900 shadow-[0_1px_3px_rgba(0,0,0,0.1)]"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <List size={11} />
            <span className="hidden sm:inline">Danh sách</span>
          </button>
          <button
            onClick={() => setView("timeline")}
            title="Dòng thời gian"
            className={`flex items-center gap-[5px] px-[10px] py-[4px] rounded-full text-[11px] font-medium transition-all ${
              view === "timeline"
                ? "bg-white text-slate-900 shadow-[0_1px_3px_rgba(0,0,0,0.1)]"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <GitCommitVertical size={11} />
            <span className="hidden sm:inline">Dòng thời gian</span>
          </button>
        </div>
      </div>

      <div className="flex items-center gap-[6px] mb-[15px] overflow-x-auto pb-[2px]">
        <Tag size={11} className="text-slate-400 shrink-0" />
        <button
          onClick={() => setCategoryFilter("all")}
          className={`shrink-0 px-[9px] py-[4px] rounded-full text-[10px] font-medium transition-all ${
            categoryFilter === "all" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200/70"
          }`}
        >
          Tất cả danh mục
        </button>
        {categories.map((cat) => {
          const color = categoryColor(cat.color);
          const Icon = categoryIcon(cat.icon);
          const active = categoryFilter === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setCategoryFilter(cat.id)}
              className={`shrink-0 flex items-center gap-[4px] px-[9px] py-[4px] rounded-full text-[10px] font-medium transition-all ${
                active ? `${color.bg} ${color.text} ring-1 ${color.ring}` : "bg-slate-100 text-slate-500 hover:bg-slate-200/70"
              }`}
            >
              <Icon size={9} />
              {cat.name}
            </button>
          );
        })}
        <button
          onClick={() => setCategoryFilter(UNCATEGORIZED)}
          className={`shrink-0 px-[9px] py-[4px] rounded-full text-[10px] font-medium transition-all ${
            categoryFilter === UNCATEGORIZED
              ? "bg-slate-900 text-white"
              : "bg-slate-100 text-slate-500 hover:bg-slate-200/70"
          }`}
        >
          Chưa phân loại
        </button>
      </div>

      {view === "list" ? (
        <div className="space-y-[15px]">
          {groups.map(([date, txs]) => (
            <div
              key={date}
              className="bg-white rounded-3xl border border-black/5 overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
            >
              <div className="px-[21px] py-[10px] bg-slate-50/70 border-b border-slate-100">
                <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400 capitalize">
                  {formatGroupLabel(date)}
                </p>
              </div>
              <ul className="divide-y divide-slate-100">
                {txs.map((tx) => (
                  <li
                    key={tx.id}
                    className="group flex items-center justify-between px-[21px] py-[12px] hover:bg-slate-50/70 transition-colors"
                  >
                    <div className="flex items-center gap-[10px] min-w-0">
                      <div
                        className={`w-[27px] h-[27px] rounded-full flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                          tx.type === "in" ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {tx.type === "in" ? <ArrowDownLeft size={12} /> : <ArrowUpRight size={12} />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[12px] font-medium text-slate-900 truncate">{tx.desc}</p>
                        {tx.type === "out" && (
                          <div className="mt-[3px]">
                            <CategoryBadge categoryId={tx.categoryId} />
                          </div>
                        )}
                      </div>
                    </div>
                    <p
                      className={`text-[12px] font-semibold shrink-0 ${
                        tx.type === "in" ? "text-emerald-600" : "text-slate-900"
                      }`}
                    >
                      {tx.type === "in" ? "+" : "-"}
                      {formatVND(tx.amount)}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          {groups.length === 0 && (
            <div className="bg-white rounded-3xl border border-black/5 py-[40px] text-center shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
              <p className="text-slate-400 text-[12px]">Không tìm thấy giao dịch nào.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-black/5 p-[21px] shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          {groups.length === 0 ? (
            <div className="py-[20px] text-center">
              <p className="text-slate-400 text-[12px]">Không tìm thấy giao dịch nào.</p>
            </div>
          ) : (
            <div className="relative">
              <div className="absolute top-[6px] bottom-[6px] left-[14px] w-px bg-slate-300" />
              <div className="space-y-[24px]">
                {groups.map(([date, txs]) => (
                  <div key={date} className="relative">
                    <div className="flex items-center gap-[10px] mb-[12px]">
                      <span className="relative z-10 w-[29px] h-[29px] rounded-full bg-slate-900 text-white flex items-center justify-center shrink-0 ring-4 ring-white shadow-[0_0_0_1px_rgba(0,0,0,0.05)]">
                        <GitCommitVertical size={12} />
                      </span>
                      <p className="text-[11px] font-semibold text-slate-700 capitalize">{formatGroupLabel(date)}</p>
                    </div>

                    <div className="pl-[38px] space-y-[10px]">
                      {txs.map((tx) => (
                        <div key={tx.id} className="group relative">
                          <span
                            className={`absolute -left-[30px] top-1/2 -translate-y-1/2 z-10 w-[9px] h-[9px] rounded-full ring-4 ring-white transition-transform duration-200 group-hover:scale-125 ${
                              tx.type === "in" ? "bg-emerald-500" : "bg-slate-400"
                            }`}
                          />
                          <div className="flex items-center justify-between gap-[10px] bg-slate-50/70 hover:bg-slate-50 rounded-2xl px-[14px] py-[10px] transition-colors">
                            <div className="flex items-center gap-[9px] min-w-0">
                              <div
                                className={`w-[24px] h-[24px] rounded-full flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                                  tx.type === "in" ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-600"
                                }`}
                              >
                                {tx.type === "in" ? <ArrowDownLeft size={11} /> : <ArrowUpRight size={11} />}
                              </div>
                              <div className="min-w-0">
                                <p className="text-[12px] font-medium text-slate-900 truncate">{tx.desc}</p>
                                {tx.type === "out" && (
                                  <div className="mt-[3px]">
                                    <CategoryBadge categoryId={tx.categoryId} />
                                  </div>
                                )}
                              </div>
                            </div>
                            <p
                              className={`text-[12px] font-semibold shrink-0 transition-transform duration-200 group-hover:scale-105 ${
                                tx.type === "in" ? "text-emerald-600" : "text-slate-900"
                              }`}
                            >
                              {tx.type === "in" ? "+" : "-"}
                              {formatVND(tx.amount)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
