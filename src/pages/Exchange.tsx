import { useState } from "react";
import { ArrowLeftRight, TrendingUp, TrendingDown } from "lucide-react";
import { formatVND } from "../lib/mockData.ts";

interface Rate {
  code: string;
  name: string;
  flag: string;
  buy: number;
  sell: number;
  change: number;
}

const RATES: Rate[] = [
  { code: "USD", name: "Đô la Mỹ", flag: "🇺🇸", buy: 25150, sell: 25520, change: 0.12 },
  { code: "EUR", name: "Euro", flag: "🇪🇺", buy: 27020, sell: 27480, change: -0.08 },
  { code: "JPY", name: "Yên Nhật (100)", flag: "🇯🇵", buy: 16180, sell: 16540, change: 0.25 },
  { code: "GBP", name: "Bảng Anh", flag: "🇬🇧", buy: 31650, sell: 32180, change: -0.15 },
  { code: "AUD", name: "Đô la Úc", flag: "🇦🇺", buy: 16420, sell: 16780, change: 0.05 },
  { code: "KRW", name: "Won Hàn Quốc (100)", flag: "🇰🇷", buy: 1720, sell: 1810, change: -0.32 },
  { code: "SGD", name: "Đô la Singapore", flag: "🇸🇬", buy: 18540, sell: 18920, change: 0.18 },
  { code: "CNY", name: "Nhân dân tệ", flag: "🇨🇳", buy: 3450, sell: 3560, change: 0.02 },
];

export default function Exchange() {
  const [selectedCode, setSelectedCode] = useState("USD");
  const [direction, setDirection] = useState<"toVnd" | "fromVnd">("toVnd");
  const [amount, setAmount] = useState("100");

  const selected = RATES.find((r) => r.code === selectedCode)!;
  const amountNumber = Number(amount) || 0;
  const rate = direction === "toVnd" ? selected.buy : selected.sell;
  const result = direction === "toVnd" ? amountNumber * rate : amountNumber / rate;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-[18px] text-center">
        <h1 className="text-[22px] font-semibold text-slate-900 tracking-tight mb-[3px]">Tỷ giá ngoại tệ</h1>
        <p className="text-slate-500 text-[13px]">Tỷ giá mua/bán cập nhật và công cụ quy đổi nhanh.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-[12px]">
        {/* Converter */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-black/5 p-[15px] shadow-[0_1px_2px_rgba(0,0,0,0.04)] h-fit">
          <h2 className="flex items-center gap-[6px] text-[13px] font-semibold text-slate-900 tracking-tight mb-[15px]">
            <ArrowLeftRight size={13} />
            Quy đổi nhanh
          </h2>

          <div className="space-y-[12px]">
            <div>
              <label className="block text-[11px] font-medium text-slate-500 mb-[6px]">Loại tiền</label>
              <select
                value={selectedCode}
                onChange={(e) => setSelectedCode(e.target.value)}
                className="w-full px-[12px] py-[9px] rounded-2xl bg-slate-100 border-0 text-[12px] font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 appearance-none"
              >
                {RATES.map((r) => (
                  <option key={r.code} value={r.code}>
                    {r.flag} {r.code} — {r.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="relative flex gap-[4px] bg-slate-100 p-[3px] rounded-2xl">
              <div
                className="absolute top-[3px] bottom-[3px] left-[3px] w-[calc(50%-6px)] rounded-xl bg-white shadow-sm transition-transform duration-300 ease-out"
                style={{ transform: direction === "fromVnd" ? "translateX(calc(100% + 6px))" : "translateX(0)" }}
              />
              <button
                type="button"
                onClick={() => setDirection("toVnd")}
                className={`relative z-10 flex-1 py-[7px] rounded-xl text-[11px] font-medium transition-colors duration-300 ${
                  direction === "toVnd" ? "text-slate-900" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {selectedCode} → VNĐ
              </button>
              <button
                type="button"
                onClick={() => setDirection("fromVnd")}
                className={`relative z-10 flex-1 py-[7px] rounded-xl text-[11px] font-medium transition-colors duration-300 ${
                  direction === "fromVnd" ? "text-slate-900" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                VNĐ → {selectedCode}
              </button>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-500 mb-[6px]">
                Số tiền ({direction === "toVnd" ? selectedCode : "VNĐ"})
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={amount}
                onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ""))}
                className="w-full px-[12px] py-[9px] rounded-2xl bg-slate-100 border-0 text-[13px] font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
              />
            </div>

            <div className="rounded-2xl bg-slate-50 p-[12px]">
              <p className="text-[10px] text-slate-400 mb-[3px]">Quy đổi ước tính</p>
              <p className="text-[17px] font-semibold text-slate-900 font-card-mono">
                {direction === "toVnd" ? formatVND(result) : `${result.toLocaleString("vi-VN", { maximumFractionDigits: 2 })} ${selectedCode}`}
              </p>
              <p className="text-[10px] text-slate-400 mt-[3px]">
                Tỷ giá áp dụng: 1 {selectedCode} = {formatVND(rate)} ({direction === "toVnd" ? "mua vào" : "bán ra"})
              </p>
            </div>
          </div>
        </div>

        {/* Rate table */}
        <div className="lg:col-span-3 bg-white rounded-3xl border border-black/5 p-[15px] shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <h2 className="text-[13px] font-semibold text-slate-900 tracking-tight mb-[12px]">Bảng tỷ giá hôm nay</h2>
          <div className="overflow-x-auto -mx-[15px] px-[15px]">
            <table className="w-full text-[11px] min-w-[420px]">
              <thead>
                <tr className="text-left text-slate-400 border-b border-slate-100">
                  <th className="font-medium pb-[8px]">Ngoại tệ</th>
                  <th className="font-medium pb-[8px] text-right">Mua vào</th>
                  <th className="font-medium pb-[8px] text-right">Bán ra</th>
                  <th className="font-medium pb-[8px] text-right">Biến động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {RATES.map((r) => (
                  <tr
                    key={r.code}
                    onClick={() => setSelectedCode(r.code)}
                    className={`cursor-pointer transition-colors hover:bg-slate-50 ${selectedCode === r.code ? "bg-slate-50" : ""}`}
                  >
                    <td className="py-[9px]">
                      <span className="flex items-center gap-[8px]">
                        <span className="text-[15px]">{r.flag}</span>
                        <span>
                          <span className="font-semibold text-slate-900">{r.code}</span>
                          <span className="text-slate-400"> · {r.name}</span>
                        </span>
                      </span>
                    </td>
                    <td className="py-[9px] text-right font-medium text-slate-900 font-card-mono">{formatVND(r.buy)}</td>
                    <td className="py-[9px] text-right font-medium text-slate-900 font-card-mono">{formatVND(r.sell)}</td>
                    <td className="py-[9px] text-right">
                      <span
                        className={`inline-flex items-center gap-[2px] font-medium ${
                          r.change >= 0 ? "text-emerald-600" : "text-red-500"
                        }`}
                      >
                        {r.change >= 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                        {Math.abs(r.change).toFixed(2)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
