import { Link, useNavigate } from "react-router-dom";
import { ArrowDownLeft, ArrowUpRight, ArrowRight, Receipt, ArrowLeftRight, QrCode, Smartphone, Coins } from "lucide-react";
import BankCard from "../components/BankCard.tsx";
import AccountCard from "../components/AccountCard.tsx";
import SpendingChart from "../components/SpendingChart.tsx";
import FinancialScoreCard from "../components/FinancialScoreCard.tsx";
import GoalProgress from "../components/GoalProgress.tsx";
import {
  mockAccounts,
  mockContacts,
  mockTransactions,
  mockUser,
  mockSpendingTrend,
  mockBills,
  formatVND,
} from "../lib/mockData.ts";
import { useGoals } from "../lib/goalStore.tsx";

export default function Dashboard() {
  const navigate = useNavigate();
  const { goals } = useGoals();
  const totalBalance = mockAccounts.reduce((sum, acc) => sum + acc.balance, 0);
  const recent = mockTransactions.slice(0, 5);
  const monthOut = mockTransactions.filter((t) => t.type === "out").reduce((s, t) => s + t.amount, 0);
  const monthIn = mockTransactions.filter((t) => t.type === "in").reduce((s, t) => s + t.amount, 0);

  function payBill() {
    navigate("/bills");
  }

  return (
    <>
      {/* ambient page background — matches the lively feel of the Transfer flow */}
      <div className="pointer-events-none fixed top-[60px] left-1/5 w-[288px] h-[288px] rounded-full bg-indigo-200/15 blur-3xl -z-10 animate-ambient-pulse" />
      <div
        className="pointer-events-none fixed bottom-[30px] right-1/5 w-[288px] h-[288px] rounded-full bg-sky-200/15 blur-3xl -z-10 animate-ambient-pulse"
        style={{ animationDelay: "3s" }}
      />

      <div className="grid grid-cols-4 sm:grid-cols-4 gap-[8px] mb-[12px]">
        {[
          { to: "/transfer", label: "Chuyển khoản", icon: ArrowLeftRight },
          { to: "/qr-pay", label: "QR Pay", icon: QrCode },
          { to: "/topup", label: "Nạp điện thoại", icon: Smartphone },
          { to: "/exchange", label: "Tỷ giá", icon: Coins },
        ].map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className="group flex flex-col items-center gap-[6px] bg-white rounded-3xl border border-black/5 py-[14px] shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] transition-shadow"
          >
            <span className="w-[32px] h-[32px] rounded-full bg-slate-100 text-slate-700 flex items-center justify-center transition-transform duration-200 group-hover:scale-110 group-hover:bg-slate-900 group-hover:text-white">
              <Icon size={14} />
            </span>
            <span className="text-[10px] font-medium text-slate-600 text-center px-[4px]">{label}</span>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-[12px]">
        {/* Main column */}
        <div className="col-span-12 xl:col-span-8 space-y-[12px]">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-[12px]">
            <div className="sm:col-span-1">
              <BankCard number={mockUser.accountNumber} balance={totalBalance} />
            </div>

            {mockAccounts.map((acc) => (
              <AccountCard
                key={acc.id}
                label={acc.label}
                number={acc.number}
                balance={acc.balance}
                monthChange={acc.monthChange}
                interestRate={acc.interestRate}
                maturityDate={acc.maturityDate}
                cardExpiry={mockUser.cardExpiry}
              />
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-[12px]">
            <FinancialScoreCard />
            <SpendingChart data={mockSpendingTrend} />
          </div>

          <div className="bg-white rounded-3xl border border-black/5 p-[15px] shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
            <div className="flex items-center justify-between mb-[15px]">
              <h2 className="text-[14px] font-semibold text-slate-900 tracking-tight">Giao dịch gần đây</h2>
              <Link
                to="/history"
                className="flex items-center gap-[3px] text-[11px] text-slate-500 font-medium hover:text-slate-900 transition-colors"
              >
                Xem tất cả <ArrowRight size={10} />
              </Link>
            </div>

            <ul className="divide-y divide-slate-100">
              {recent.map((tx) => (
                <li
                  key={tx.id}
                  className="group flex items-center justify-between py-[10px] hover:bg-slate-50/70 -mx-2 px-[6px] rounded-xl transition-colors"
                >
                  <div className="flex items-center gap-[10px]">
                    <div
                      className={`w-[27px] h-[27px] rounded-full flex items-center justify-center transition-transform duration-200 group-hover:scale-110 ${
                        tx.type === "in" ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {tx.type === "in" ? <ArrowDownLeft size={12} /> : <ArrowUpRight size={12} />}
                    </div>
                    <div>
                      <p className="text-[12px] font-medium text-slate-900">{tx.desc}</p>
                      <p className="text-[10px] text-slate-400 mt-[2px]">{tx.date}</p>
                    </div>
                  </div>
                  <p className={`text-[12px] font-semibold ${tx.type === "in" ? "text-emerald-600" : "text-slate-900"}`}>
                    {tx.type === "in" ? "+" : "-"}
                    {formatVND(tx.amount)}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Side column — room for more widgets over time */}
        <div className="col-span-12 xl:col-span-4 space-y-[12px]">
          <div className="bg-white rounded-3xl border border-black/5 p-[15px] shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
            <h2 className="text-[13px] font-semibold text-slate-900 tracking-tight mb-[12px]">Thu chi tháng này</h2>
            <div className="space-y-[9px]">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500">Tiền vào</span>
                <span className="font-semibold text-emerald-600">+{formatVND(monthIn)}</span>
              </div>
              <div className="h-[6px] rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-emerald-500" style={{ width: `${Math.min((monthIn / (monthIn + monthOut)) * 100, 100)}%` }} />
              </div>
              <div className="flex items-center justify-between text-[11px] pt-[3px]">
                <span className="text-slate-500">Tiền ra</span>
                <span className="font-semibold text-slate-900">-{formatVND(monthOut)}</span>
              </div>
              <div className="h-[6px] rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-slate-900" style={{ width: `${Math.min((monthOut / (monthIn + monthOut)) * 100, 100)}%` }} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-black/5 p-[15px] shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
            <div className="flex items-center justify-between mb-[12px]">
              <h2 className="text-[13px] font-semibold text-slate-900 tracking-tight">Hóa đơn sắp đến hạn</h2>
              <Link to="/bills" className="text-[10px] text-slate-500 font-medium hover:text-slate-900">
                Xem tất cả
              </Link>
            </div>
            <ul className="space-y-[10px]">
              {mockBills.map((bill) => (
                <li key={bill.id} className="group flex items-center gap-[9px]">
                  <span className="w-[24px] h-[24px] rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-110 group-hover:rotate-6">
                    <Receipt size={10} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-medium text-slate-900 truncate">{bill.name}</p>
                    <p className="text-[10px] text-slate-400">{bill.dueLabel}</p>
                  </div>
                  <div className="flex flex-col items-end gap-[4px] shrink-0">
                    <p className="text-[11px] font-semibold text-slate-900">{formatVND(bill.amount)}</p>
                    <button
                      onClick={() => payBill()}
                      className="px-[8px] py-[3px] rounded-full bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-medium transition-colors"
                    >
                      Trả tiền
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white rounded-3xl border border-black/5 p-[15px] shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
            <div className="flex items-center justify-between mb-[12px]">
              <h2 className="text-[13px] font-semibold text-slate-900 tracking-tight">Mục tiêu tài chính</h2>
              <Link to="/goals" className="text-[10px] text-slate-500 font-medium hover:text-slate-900">
                Xem tất cả
              </Link>
            </div>
            <div className="space-y-[12px]">
              {goals.map((goal) => (
                <GoalProgress key={goal.id} name={goal.name} current={goal.current} target={goal.target} />
              ))}
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-black/5 p-[15px] shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
            <div className="flex items-center justify-between mb-[12px]">
              <h2 className="text-[13px] font-semibold text-slate-900 tracking-tight">Người nhận gần đây</h2>
              <Link to="/transfer" className="text-[10px] text-slate-500 font-medium hover:text-slate-900">
                Xem thêm
              </Link>
            </div>
            <ul className="space-y-[9px]">
              {mockContacts.map((c) => (
                <li key={c.id} className="group flex items-center gap-[9px]">
                  <span className="w-[24px] h-[24px] rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-[10px] font-semibold transition-transform duration-200 group-hover:scale-110 group-hover:bg-slate-900 group-hover:text-white">
                    {c.name.split(" ").pop()?.[0]}
                  </span>
                  <div className="min-w-0">
                    <p className="text-[11px] font-medium text-slate-900 truncate">{c.name}</p>
                    <p className="text-[10px] text-slate-400">{c.bank}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
