import { useMemo, useState, type FormEvent } from "react";
import { Plus, Trash2, PiggyBank, Wallet, AlertTriangle, Pencil, Check, X } from "lucide-react";
import { formatVND } from "../lib/mockData.ts";
import { useBudget } from "../lib/budgetStore.tsx";
import { CATEGORY_COLOR_KEYS, CATEGORY_ICON_KEYS, categoryColor, categoryIcon } from "../lib/categoryVisuals.ts";

function monthKey(dateStr: string): string {
  return dateStr.slice(0, 7);
}

function monthLabel(key: string): string {
  const [y, m] = key.split("-");
  return `Tháng ${Number(m)}/${y}`;
}

export default function Budget() {
  const { categories, transactions, budgetLimits, addCategory, removeCategory, setBudgetLimit } = useBudget();

  const [name, setName] = useState("");
  const [color, setColor] = useState(CATEGORY_COLOR_KEYS[0]);
  const [icon, setIcon] = useState(CATEGORY_ICON_KEYS[0]);
  const [formError, setFormError] = useState("");
  const [editingLimitId, setEditingLimitId] = useState<string | null>(null);
  const [limitInput, setLimitInput] = useState("");

  const availableMonths = useMemo(() => {
    const set = new Set(transactions.filter((t) => t.type === "out").map((t) => monthKey(t.date)));
    return Array.from(set).sort((a, b) => (a < b ? 1 : -1));
  }, [transactions]);

  const [selectedMonth, setSelectedMonth] = useState(availableMonths[0] ?? monthKey(new Date().toISOString()));

  const monthTxs = useMemo(
    () => transactions.filter((t) => t.type === "out" && monthKey(t.date) === selectedMonth),
    [transactions, selectedMonth]
  );

  const monthTotal = monthTxs.reduce((s, t) => s + t.amount, 0);

  const breakdown = useMemo(() => {
    const map = new Map<string, number>();
    for (const tx of monthTxs) {
      const key = tx.categoryId ?? "uncategorized";
      map.set(key, (map.get(key) ?? 0) + tx.amount);
    }
    return Array.from(map.entries())
      .map(([categoryId, amount]) => ({ categoryId, amount }))
      .sort((a, b) => b.amount - a.amount);
  }, [monthTxs]);

  function handleAddCategory(e: FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setFormError("Vui lòng nhập tên danh mục.");
      return;
    }
    if (categories.some((c) => c.name.toLowerCase() === trimmed.toLowerCase())) {
      setFormError("Danh mục này đã tồn tại.");
      return;
    }
    addCategory(trimmed, color, icon);
    setName("");
    setFormError("");
  }

  function startEditLimit(categoryId: string) {
    setEditingLimitId(categoryId);
    setLimitInput(budgetLimits[categoryId] ? String(budgetLimits[categoryId]) : "");
  }

  function saveLimit(categoryId: string) {
    const parsed = Number(limitInput.replace(/[^0-9]/g, ""));
    setBudgetLimit(categoryId, parsed > 0 ? parsed : undefined);
    setEditingLimitId(null);
    setLimitInput("");
  }

  return (
    <>
      <div className="pointer-events-none fixed top-[60px] left-1/5 w-[288px] h-[288px] rounded-full bg-indigo-200/15 blur-3xl -z-10 animate-ambient-pulse" />
      <div
        className="pointer-events-none fixed bottom-[30px] right-1/5 w-[288px] h-[288px] rounded-full bg-sky-200/15 blur-3xl -z-10 animate-ambient-pulse"
        style={{ animationDelay: "3s" }}
      />

      <h1 className="text-[22px] font-semibold text-slate-900 tracking-tight mb-[3px]">Quản lý chi tiêu</h1>
      <p className="text-slate-500 mb-[18px] text-[13px]">
        Tạo danh mục chi tiêu và theo dõi số tiền đã dùng cho từng danh mục mỗi tháng.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-[12px]">
        {/* Overview */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-black/5 p-[15px] shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-between mb-[12px] flex-wrap gap-[8px]">
            <h2 className="text-[14px] font-semibold text-slate-900 tracking-tight">Tổng quan chi tiêu theo tháng</h2>
            <div className="flex gap-[3px] bg-slate-100 rounded-full p-[3px] w-fit">
              {availableMonths.length === 0 ? (
                <span className="px-[10px] py-[4px] text-[11px] text-slate-400">Chưa có dữ liệu</span>
              ) : (
                availableMonths.map((m) => (
                  <button
                    key={m}
                    onClick={() => setSelectedMonth(m)}
                    className={`px-[10px] py-[4px] rounded-full text-[11px] font-medium transition-all ${
                      selectedMonth === m
                        ? "bg-white text-slate-900 shadow-[0_1px_3px_rgba(0,0,0,0.1)]"
                        : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    {monthLabel(m)}
                  </button>
                ))
              )}
            </div>
          </div>

          <div className="flex items-center gap-[10px] mb-[18px] bg-slate-50 rounded-2xl p-[15px]">
            <span className="w-[36px] h-[36px] rounded-full bg-slate-900 text-white flex items-center justify-center shrink-0">
              <Wallet size={16} />
            </span>
            <div>
              <p className="text-[10px] text-slate-500 uppercase tracking-wide font-medium">Tổng chi tiêu tháng này</p>
              <p className="text-[20px] font-semibold text-slate-900">{formatVND(monthTotal)}</p>
            </div>
          </div>

          {breakdown.length === 0 ? (
            <div className="py-[30px] text-center">
              <p className="text-slate-400 text-[12px]">Không có chi tiêu nào trong tháng này.</p>
            </div>
          ) : (
            <div className="space-y-[16px]">
              {breakdown.map(({ categoryId, amount }) => {
                const cat = categories.find((c) => c.id === categoryId);
                const color = categoryColor(cat?.color ?? "slate");
                const Icon = categoryIcon(cat?.icon ?? "other");
                const pct = monthTotal > 0 ? (amount / monthTotal) * 100 : 0;
                const limit = cat ? budgetLimits[cat.id] : undefined;
                const limitPct = limit ? Math.min((amount / limit) * 100, 100) : null;
                const isOver = limit !== undefined && amount > limit;
                const isNear = limit !== undefined && !isOver && amount / limit >= 0.8;
                const barColor = isOver ? "bg-red-500" : isNear ? "bg-amber-500" : color.dot;
                const isEditing = editingLimitId === categoryId;
                return (
                  <div key={categoryId}>
                    <div className="flex items-center justify-between mb-[6px]">
                      <div className="flex items-center gap-[8px]">
                        <span className={`w-[22px] h-[22px] rounded-full ${color.bg} ${color.text} flex items-center justify-center`}>
                          <Icon size={11} />
                        </span>
                        <span className="text-[12px] font-medium text-slate-800">{cat?.name ?? "Chưa phân loại"}</span>
                        {(isOver || isNear) && (
                          <AlertTriangle size={12} className={isOver ? "text-red-500" : "text-amber-500"} />
                        )}
                      </div>
                      <span className="text-[12px] font-semibold text-slate-900">
                        {formatVND(amount)}
                        {limit !== undefined && <span className="text-slate-400 font-normal"> / {formatVND(limit)}</span>}
                      </span>
                    </div>
                    <div className="h-[6px] rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${barColor} transition-all duration-700 ease-out`}
                        style={{ width: `${limitPct ?? pct}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between mt-[3px]">
                      <p className={`text-[10px] ${isOver ? "text-red-500 font-medium" : isNear ? "text-amber-600 font-medium" : "text-slate-400"}`}>
                        {isOver
                          ? `Đã vượt hạn mức ${formatVND(amount - limit!)}`
                          : isNear
                          ? `Gần chạm hạn mức (${((amount / limit!) * 100).toFixed(0)}%)`
                          : `${pct.toFixed(1)}% tổng chi tiêu`}
                      </p>
                      {cat && !isEditing && (
                        <button
                          onClick={() => startEditLimit(cat.id)}
                          className="flex items-center gap-[3px] text-[10px] text-slate-400 hover:text-slate-700 transition-colors"
                        >
                          <Pencil size={9} />
                          {limit !== undefined ? "Sửa hạn mức" : "Đặt hạn mức"}
                        </button>
                      )}
                      {cat && isEditing && (
                        <div className="flex items-center gap-[4px]">
                          <input
                            autoFocus
                            type="text"
                            inputMode="numeric"
                            value={limitInput}
                            onChange={(e) => setLimitInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") saveLimit(cat.id);
                              if (e.key === "Escape") setEditingLimitId(null);
                            }}
                            placeholder="Hạn mức (đ)"
                            className="w-[90px] px-[6px] py-[2px] rounded-md bg-slate-100 border-0 text-[10px] font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900/20"
                          />
                          <button onClick={() => saveLimit(cat.id)} className="text-emerald-600 hover:text-emerald-700">
                            <Check size={12} />
                          </button>
                          <button onClick={() => setEditingLimitId(null)} className="text-slate-400 hover:text-slate-600">
                            <X size={12} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Category management */}
        <div className="space-y-[12px]">
          <div className="bg-white rounded-3xl border border-black/5 p-[15px] shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
            <h2 className="flex items-center gap-[6px] text-[13px] font-semibold text-slate-900 tracking-tight mb-[12px]">
              <PiggyBank size={13} />
              Thêm danh mục mới
            </h2>
            <form onSubmit={handleAddCategory} className="space-y-[10px]">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Tên danh mục (VD: Giải trí)"
                className="w-full px-[12px] py-[9px] rounded-2xl bg-slate-100 border-0 text-[12px] font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
              />

              <div>
                <p className="text-[10px] font-medium text-slate-500 mb-[6px]">Màu sắc</p>
                <div className="flex flex-wrap gap-[6px]">
                  {CATEGORY_COLOR_KEYS.map((c) => {
                    const swatch = categoryColor(c);
                    const active = color === c;
                    return (
                      <button
                        type="button"
                        key={c}
                        onClick={() => setColor(c)}
                        className={`w-[22px] h-[22px] rounded-full ${swatch.dot} transition-all ${
                          active ? `ring-2 ring-offset-2 ${swatch.ring}` : "opacity-60 hover:opacity-100"
                        }`}
                        title={c}
                      />
                    );
                  })}
                </div>
              </div>

              <div>
                <p className="text-[10px] font-medium text-slate-500 mb-[6px]">Biểu tượng</p>
                <div className="flex flex-wrap gap-[6px]">
                  {CATEGORY_ICON_KEYS.map((k) => {
                    const Icon = categoryIcon(k);
                    const active = icon === k;
                    return (
                      <button
                        type="button"
                        key={k}
                        onClick={() => setIcon(k)}
                        className={`w-[26px] h-[26px] rounded-full flex items-center justify-center transition-all ${
                          active ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200/70"
                        }`}
                      >
                        <Icon size={12} />
                      </button>
                    );
                  })}
                </div>
              </div>

              {formError && <p className="text-[11px] text-red-500 font-medium">{formError}</p>}

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-[6px] py-[9px] rounded-2xl text-[12px] font-medium bg-slate-900 hover:bg-slate-800 text-white transition-colors"
              >
                <Plus size={12} />
                Thêm danh mục
              </button>
            </form>
          </div>

          <div className="bg-white rounded-3xl border border-black/5 p-[15px] shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
            <h2 className="text-[13px] font-semibold text-slate-900 tracking-tight mb-[12px]">
              Danh mục hiện có ({categories.length})
            </h2>
            <ul className="space-y-[6px]">
              {categories.map((cat) => {
                const color = categoryColor(cat.color);
                const Icon = categoryIcon(cat.icon);
                return (
                  <li
                    key={cat.id}
                    className="group flex items-center justify-between px-[10px] py-[8px] rounded-2xl hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-[8px] min-w-0">
                      <span className={`w-[24px] h-[24px] rounded-full ${color.bg} ${color.text} flex items-center justify-center shrink-0`}>
                        <Icon size={11} />
                      </span>
                      <span className="text-[12px] font-medium text-slate-800 truncate">{cat.name}</span>
                    </div>
                    <button
                      onClick={() => removeCategory(cat.id)}
                      className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-all shrink-0"
                      title="Xóa danh mục"
                    >
                      <Trash2 size={13} />
                    </button>
                  </li>
                );
              })}
              {categories.length === 0 && (
                <p className="text-[11px] text-slate-400 text-center py-[10px]">Chưa có danh mục nào.</p>
              )}
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
