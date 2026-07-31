import { useState } from "react";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { mockTransactions, formatVND, type TransactionType } from "../lib/mockData.ts";

type Filter = "all" | TransactionType;

export default function History() {
  const [filter, setFilter] = useState<Filter>("all");

  const filtered = mockTransactions.filter((tx) => filter === "all" || tx.type === filter);

  return (
    <>
      <h1 className="text-[22px] font-semibold text-slate-900 tracking-tight mb-[3px]">Lịch sử giao dịch</h1>
      <p className="text-slate-500 mb-[18px] text-[13px]">Toàn bộ giao dịch trên các tài khoản của bạn.</p>

      <div className="flex gap-[3px] mb-[15px] bg-slate-100 rounded-full p-[3px] w-fit">
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

      <div className="bg-white rounded-3xl border border-black/5 overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
        <table className="w-full text-[12px]">
          <thead>
            <tr className="text-slate-400 text-left">
              <th className="px-[21px] py-[12px] font-medium text-[10px] uppercase tracking-wide">Giao dịch</th>
              <th className="px-[21px] py-[12px] font-medium text-[10px] uppercase tracking-wide">Ngày</th>
              <th className="px-[21px] py-[12px] font-medium text-[10px] uppercase tracking-wide text-right">Số tiền</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((tx) => (
              <tr key={tx.id} className="hover:bg-slate-50/70 transition-colors">
                <td className="px-[21px] py-[12px]">
                  <div className="flex items-center gap-[10px]">
                    <div
                      className={`w-[27px] h-[27px] rounded-full flex items-center justify-center ${
                        tx.type === "in" ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {tx.type === "in" ? <ArrowDownLeft size={12} /> : <ArrowUpRight size={12} />}
                    </div>
                    <span className="font-medium text-slate-900">{tx.desc}</span>
                  </div>
                </td>
                <td className="px-[21px] py-[12px] text-slate-400">{tx.date}</td>
                <td
                  className={`px-[21px] py-[12px] text-right font-semibold ${
                    tx.type === "in" ? "text-emerald-600" : "text-slate-900"
                  }`}
                >
                  {tx.type === "in" ? "+" : "-"}
                  {formatVND(tx.amount)}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={3} className="px-[21px] py-[30px] text-center text-slate-400">
                  Không có giao dịch nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
