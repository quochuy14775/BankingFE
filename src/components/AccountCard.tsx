import { Wallet, PiggyBank, TrendingUp, CalendarClock } from "lucide-react";
import { formatVND } from "../lib/mockData.ts";
import CountUp from "./CountUp.tsx";

interface AccountCardProps {
  label: string;
  number: string;
  balance: number;
  monthChange?: number;
  interestRate?: number;
  maturityDate?: string;
  cardExpiry?: string;
  delayMs?: number;
}

function inferType(label: string): "checking" | "savings" {
  return label.toLowerCase().includes("tiết kiệm") ? "savings" : "checking";
}

const THEME = {
  checking: {
    icon: Wallet,
    badgeLabel: "Thanh toán",
    background: "linear-gradient(135deg, #3b5bdb 0%, #24346b 42%, #131c3d 78%, #0a0e1f 100%)",
    glowA: "bg-blue-400/20",
    glowB: "bg-indigo-500/20",
    sheen: "linear-gradient(115deg, transparent 20%, #93c5fd 32%, #a5b4fc 46%, #c4b5fd 58%, transparent 72%)",
    badgeBg: "bg-white/15 text-blue-100",
  },
  savings: {
    icon: PiggyBank,
    badgeLabel: "Tiết kiệm",
    background: "linear-gradient(135deg, #10b981 0%, #0f4c3f 42%, #0c2a26 78%, #071613 100%)",
    glowA: "bg-emerald-400/20",
    glowB: "bg-teal-500/20",
    sheen: "linear-gradient(115deg, transparent 20%, #6ee7b7 32%, #5eead4 46%, #a7f3d0 58%, transparent 72%)",
    badgeBg: "bg-white/15 text-emerald-100",
  },
} as const;

export default function AccountCard({
  label,
  number,
  balance,
  monthChange,
  interestRate,
  maturityDate,
  cardExpiry = "12/28",
  delayMs = 0,
}: AccountCardProps) {
  const type = inferType(label);
  const theme = THEME[type];
  const Icon = theme.icon;
  const last4 = number.replace(/\s/g, "").slice(-4);

  return (
    <div
      className="group relative rounded-3xl p-[15px] overflow-hidden text-white min-h-[165px] flex flex-col justify-between transition-all duration-300 hover:-translate-y-0.5 animate-step-in"
      style={{
        background: theme.background,
        boxShadow: "0 20px 40px -16px rgba(15,23,42,0.5), inset 0 1px 0 rgba(255,255,255,0.06)",
        animationDelay: `${delayMs}ms`,
      }}
    >
      {/* border ring */}
      <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-inset ring-white/10" />

      {/* ambient glow blobs, always breathing */}
      <div className={`pointer-events-none absolute -top-16 -right-10 w-[168px] h-[168px] rounded-full blur-3xl ${theme.glowA} animate-ambient-pulse`} />
      <div
        className={`pointer-events-none absolute -bottom-20 -left-12 w-[168px] h-[168px] rounded-full blur-3xl ${theme.glowB} animate-ambient-pulse`}
        style={{ animationDelay: "2.5s" }}
      />

      {/* glass reflection band */}
      <div
        className="pointer-events-none absolute -inset-y-10 -inset-x-4 rotate-[8deg]"
        style={{
          background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.12) 42%, rgba(255,255,255,0.16) 48%, rgba(255,255,255,0.12) 54%, transparent 100%)",
          top: "-40%",
          height: "55%",
        }}
      />

      {/* hover sheen */}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-40 transition-opacity duration-500 mix-blend-color-dodge"
        style={{ background: theme.sheen }}
      />

      <div className="relative flex items-center justify-between">
        <p className="text-[11px] font-medium text-white/70">{label}</p>
        <span className={`flex items-center gap-[4px] px-[8px] py-[3px] rounded-full text-[10px] font-semibold ${theme.badgeBg}`}>
          <Icon size={10} />
          {theme.badgeLabel}
        </span>
      </div>

      <div className="relative">
        <p className="text-2xl font-semibold tracking-tight tabular-nums">
          <CountUp value={balance} format={(n) => formatVND(Math.round(n))} />
        </p>

        {type === "checking" && monthChange !== undefined && (
          <p className="flex items-center gap-[3px] text-[10px] text-emerald-200/90 font-medium mt-[8px]">
            <TrendingUp size={10} />
            +{formatVND(monthChange)} tháng này
          </p>
        )}

        {type === "savings" && (interestRate !== undefined || maturityDate) && (
          <div className="flex items-center gap-[12px] mt-[8px]">
            {interestRate !== undefined && (
              <p className="flex items-center gap-[3px] text-[10px] text-emerald-200/90 font-medium">
                <TrendingUp size={10} />
                {interestRate}%/năm
              </p>
            )}
            {maturityDate && (
              <p className="flex items-center gap-[3px] text-[10px] text-white/60 font-medium">
                <CalendarClock size={10} />
                Đáo hạn {maturityDate}
              </p>
            )}
          </div>
        )}
      </div>

      {/* chip */}
      <div className="relative mt-[12px]">
        <div
          className="w-[27px] h-[21px] rounded-md relative overflow-hidden"
          style={{
            background: "linear-gradient(155deg, #f4e5b3 0%, #d9bd7a 35%, #b8944f 70%, #8f6f39 100%)",
            boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.15)",
          }}
        >
          <div className="absolute inset-0 grid grid-cols-3 grid-rows-2 gap-[1px] p-[2px]">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-black/10 rounded-[1px]" />
            ))}
          </div>
        </div>
      </div>

      <div className="relative mt-[9px] flex items-end justify-between">
        <div>
          <p className="text-[9px] text-white/40 uppercase tracking-wider mb-[3px]">Số thẻ</p>
          <p className="font-card-mono font-medium text-[11px] tracking-[0.12em] text-white/90">
            •••• •••• •••• {last4}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[9px] text-white/40 uppercase tracking-wider mb-[3px]">Hết hạn</p>
          <p className="font-card-mono font-medium text-[10px] text-white/90">{cardExpiry}</p>
        </div>
      </div>

      {/* traveling dot along the bottom edge — always on at low opacity, brightens on hover */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/10 overflow-hidden opacity-40 group-hover:opacity-100 transition-opacity">
        <div
          className="absolute top-1/2 -translate-y-1/2 w-[6px] h-[6px] rounded-full bg-white shadow-[0_0_6px_rgba(255,255,255,0.8)] animate-travel-dot"
          style={{ animationDelay: `${delayMs}ms` }}
        />
      </div>
    </div>
  );
}
