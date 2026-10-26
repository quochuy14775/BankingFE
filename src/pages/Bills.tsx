import { useMemo, useState, type FormEvent } from "react";
import { CheckCircle2, Plus, Repeat, Trash2, Receipt as ReceiptIcon } from "lucide-react";
import { formatVND } from "../lib/mockData.ts";
import { useBills, type BillCategory } from "../lib/billStore.tsx";
import { useBudget } from "../lib/budgetStore.tsx";
import {
  BILL_CATEGORY_COLORS,
  BILL_CATEGORY_ICONS,
  BILL_CATEGORY_KEYS,
  BILL_CATEGORY_LABELS,
  dueLabel,
} from "../lib/billVisuals.ts";

export default function Bills() {
  const { providers, payments, addProvider, removeProvider, toggleAutopay, payBill } = useBills();
  const { addTransaction } = useBudget();

  const [name, setName] = useState("");
  const [category, setCategory] = useState<BillCategory>("electric");
  const [customerCode, setCustomerCode] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [formError, setFormError] = useState("");
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [paidToast, setPaidToast] = useState<string | null>(null);

  const sortedProviders = useMemo(
    () => [...providers].sort((a, b) => a.dueDate.localeCompare(b.dueDate)),
    [providers]
  );

  const totalDue = providers.reduce((s, p) => s + p.amount, 0);
  const autopayCount = providers.filter((p) => p.autopay).length;

  function handleAddProvider(e: FormEvent) {
    e.preventDefault();
    const trimmedName = name.trim();
    const trimmedCode = customerCode.trim();
    const parsedAmount = Number(amount);

    if (!trimmedName || !trimmedCode) {
      setFormError("Vui lòng nhập đầy đủ tên nhà cung cấp và mã khách hàng.");
      return;
    }
    if (!amount || !Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setFormError("Số tiền không hợp lệ.");
      return;
    }
    if (!dueDate) {
      setFormError("Vui lòng chọn ngày đến hạn.");
      return;
    }

    addProvider({ name: trimmedName, category, customerCode: trimmedCode, amount: parsedAmount, dueDate });
    setName("");
    setCustomerCode("");
    setAmount("");
    setDueDate("");
    setFormError("");
  }

  function confirmPay(id: string) {
    const provider = providers.find((p) => p.id === id);
    if (!provider) return;
    const payment = payBill(id);
    if (payment) {
      addTransaction({
        date: payment.date,
        type: "out",
        desc: `Thanh toán ${payment.providerName}`,
        amount: payment.amount,
      });
      setPaidToast(`Đã thanh toán ${formatVND(payment.amount)} cho ${payment.providerName}`);
      setTimeout(() => setPaidToast(null), 3000);
    }
    setConfirmId(null);
  }

  return (
    <>
      <div className="pointer-events-none fixed top-[60px] left-1/5 w-[288px] h-[288px] rounded-full bg-indigo-200/15 blur-3xl -z-10 animate-ambient-pulse" />
      <div
        className="pointer-events-none fixed bottom-[30px] right-1/5 w-[288px] h-[288px] rounded-full bg-sky-200/15 blur-3xl -z-10 animate-ambient-pulse"
        style={{ animationDelay: "3s" }}
      />

      <h1 className="text-[22px] font-semibold text-slate-900 tracking-tight mb-[3px]">Thanh toán hóa đơn</h1>
      <p className="text-slate-500 mb-[18px] text-[13px]">
        Quản lý nhà cung cấp dịch vụ, thanh toán hóa đơn và bật tự động thanh toán định kỳ.
      </p>

      {paidToast && (
        <div className="mb-[12px] flex items-center gap-[8px] px-[14px] py-[10px] rounded-2xl bg-emerald-50 text-emerald-700 text-[12px] font-medium">
          <CheckCircle2 size={14} />
          {paidToast}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-[12px]">
        {/* Providers + history */}
        <div className="lg:col-span-2 space-y-[12px]">
          <div className="bg-white rounded-3xl border border-black/5 p-[15px] shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
            <div className="flex items-center justify-between mb-[12px] flex-wrap gap-[8px]">
              <h2 className="text-[14px] font-semibold text-slate-900 tracking-tight">Nhà cung cấp dịch vụ</h2>
              <div className="flex items-center gap-[12px] text-[11px] text-slate-500">
                <span>
                  Tổng cần trả: <span className="font-semibold text-slate-900">{formatVND(totalDue)}</span>
                </span>
                <span className="flex items-center gap-[3px]">
                  <Repeat size={11} /> {autopayCount} tự động
                </span>
              </div>
            </div>

            {sortedProviders.length === 0 ? (
              <p className="text-[11px] text-slate-400 text-center py-[20px]">Chưa có nhà cung cấp nào.</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {sortedProviders.map((p) => {
                  const Icon = BILL_CATEGORY_ICONS[p.category];
                  const color = BILL_CATEGORY_COLORS[p.category];
                  const overdue = dueLabel(p.dueDate).startsWith("Quá hạn");
                  return (
                    <li key={p.id} className="group flex items-center gap-[10px] py-[12px]">
                      <span className={`w-[30px] h-[30px] rounded-full ${color.bg} ${color.text} flex items-center justify-center shrink-0`}>
                        <Icon size={13} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-[12px] font-medium text-slate-900 truncate">{p.name}</p>
                        <p className="text-[10px] text-slate-400">
                          {BILL_CATEGORY_LABELS[p.category]} · Mã KH: {p.customerCode}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-[3px] shrink-0">
                        <p className="text-[12px] font-semibold text-slate-900">{formatVND(p.amount)}</p>
                        <p className={`text-[10px] ${overdue ? "text-red-500 font-medium" : "text-slate-400"}`}>
                          {dueLabel(p.dueDate)}
                        </p>
                      </div>
                      <div className="flex items-center gap-[6px] shrink-0">
                        <button
                          onClick={() => toggleAutopay(p.id)}
                          title="Bật/tắt tự động thanh toán"
                          className={`px-[8px] py-[4px] rounded-full text-[10px] font-medium transition-colors flex items-center gap-[3px] ${
                            p.autopay ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-500 hover:bg-slate-200/70"
                          }`}
                        >
                          <Repeat size={10} />
                          {p.autopay ? "Tự động" : "Thủ công"}
                        </button>
                        <button
                          onClick={() => setConfirmId(p.id)}
                          className="px-[10px] py-[4px] rounded-full bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-medium transition-colors"
                        >
                          Trả tiền
                        </button>
                        <button
                          onClick={() => removeProvider(p.id)}
                          className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-all"
                          title="Xóa nhà cung cấp"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div className="bg-white rounded-3xl border border-black/5 p-[15px] shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
            <h2 className="flex items-center gap-[6px] text-[14px] font-semibold text-slate-900 tracking-tight mb-[12px]">
              <ReceiptIcon size={13} />
              Lịch sử thanh toán
            </h2>
            {payments.length === 0 ? (
              <p className="text-[11px] text-slate-400 text-center py-[20px]">Chưa có giao dịch thanh toán nào.</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {payments.map((pay) => (
                  <li key={pay.id} className="flex items-center justify-between py-[9px]">
                    <div>
                      <p className="text-[12px] font-medium text-slate-900">{pay.providerName}</p>
                      <p className="text-[10px] text-slate-400">
                        {pay.date} · {pay.method === "auto" ? "Tự động" : "Thủ công"}
                      </p>
                    </div>
                    <p className="text-[12px] font-semibold text-slate-900">-{formatVND(pay.amount)}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Add provider form */}
        <div className="bg-white rounded-3xl border border-black/5 p-[15px] shadow-[0_1px_2px_rgba(0,0,0,0.04)] h-fit">
          <h2 className="flex items-center gap-[6px] text-[13px] font-semibold text-slate-900 tracking-tight mb-[12px]">
            <Plus size={13} />
            Thêm nhà cung cấp
          </h2>
          <form onSubmit={handleAddProvider} className="space-y-[10px]">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Tên nhà cung cấp (VD: Điện lực EVN)"
              className="w-full px-[12px] py-[9px] rounded-2xl bg-slate-100 border-0 text-[12px] font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
            />

            <div>
              <p className="text-[10px] font-medium text-slate-500 mb-[6px]">Loại dịch vụ</p>
              <div className="flex flex-wrap gap-[6px]">
                {BILL_CATEGORY_KEYS.map((k) => {
                  const Icon = BILL_CATEGORY_ICONS[k];
                  const active = category === k;
                  return (
                    <button
                      type="button"
                      key={k}
                      onClick={() => setCategory(k)}
                      className={`flex items-center gap-[4px] px-[9px] py-[5px] rounded-full text-[10px] font-medium transition-all ${
                        active ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200/70"
                      }`}
                    >
                      <Icon size={11} />
                      {BILL_CATEGORY_LABELS[k]}
                    </button>
                  );
                })}
              </div>
            </div>

            <input
              type="text"
              value={customerCode}
              onChange={(e) => setCustomerCode(e.target.value)}
              placeholder="Mã khách hàng"
              className="w-full px-[12px] py-[9px] rounded-2xl bg-slate-100 border-0 text-[12px] font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
            />

            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Số tiền (VNĐ)"
              min="0"
              className="w-full px-[12px] py-[9px] rounded-2xl bg-slate-100 border-0 text-[12px] font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
            />

            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-[12px] py-[9px] rounded-2xl bg-slate-100 border-0 text-[12px] font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
            />

            {formError && <p className="text-[11px] text-red-500 font-medium">{formError}</p>}

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-[6px] py-[9px] rounded-2xl text-[12px] font-medium bg-slate-900 hover:bg-slate-800 text-white transition-colors"
            >
              <Plus size={12} />
              Thêm nhà cung cấp
            </button>
          </form>
        </div>
      </div>

      {/* Confirm pay modal */}
      {confirmId && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/30 backdrop-blur-sm px-[16px]">
          <div className="bg-white rounded-3xl border border-black/5 shadow-[0_20px_60px_rgba(0,0,0,0.2)] p-[20px] w-full max-w-[360px]">
            {(() => {
              const p = providers.find((x) => x.id === confirmId);
              if (!p) return null;
              return (
                <>
                  <h3 className="text-[15px] font-semibold text-slate-900 mb-[6px]">Xác nhận thanh toán</h3>
                  <p className="text-[12px] text-slate-500 mb-[14px]">
                    Thanh toán <span className="font-medium text-slate-900">{formatVND(p.amount)}</span> cho{" "}
                    <span className="font-medium text-slate-900">{p.name}</span> (mã KH: {p.customerCode})?
                  </p>
                  <div className="flex gap-[8px]">
                    <button
                      onClick={() => setConfirmId(null)}
                      className="flex-1 py-[9px] rounded-2xl text-[12px] font-medium bg-slate-100 hover:bg-slate-200/70 text-slate-700 transition-colors"
                    >
                      Hủy
                    </button>
                    <button
                      onClick={() => confirmPay(p.id)}
                      className="flex-1 py-[9px] rounded-2xl text-[12px] font-medium bg-slate-900 hover:bg-slate-800 text-white transition-colors"
                    >
                      Xác nhận
                    </button>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </>
  );
}
