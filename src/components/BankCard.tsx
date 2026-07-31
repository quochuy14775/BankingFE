import { useEffect, useRef, useState } from "react";
import { Eye, EyeOff, Wifi } from "lucide-react";
import { mockUser } from "../lib/mockData.ts";

interface BankCardProps {
  number: string;
  balance: number;
}

function useCountUp(target: number, active: boolean, duration = 2000) {
  const [value, setValue] = useState(active ? 0 : target);
  const frame = useRef<number>(0);

  useEffect(() => {
    if (!active) return;
    const start = performance.now();
    const from = 0;

    function tick(now: number) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(from + (target - from) * eased));
      if (progress < 1) frame.current = requestAnimationFrame(tick);
    }

    frame.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame.current);
  }, [target, active, duration]);

  return value;
}

export default function BankCard({ number, balance }: BankCardProps) {
  const [visible, setVisible] = useState(true);
  const animatedBalance = useCountUp(balance, visible);
  const last4 = number.replace(/\s/g, "").slice(-4);

  return (
    <div
      className="group relative rounded-3xl p-[15px] flex flex-col justify-between overflow-hidden text-white min-h-[142px] transition-shadow duration-300 hover:shadow-[0_32px_60px_-16px_rgba(15,23,42,0.65),inset_0_1px_0_rgba(255,255,255,0.08)]"
      style={{
        background:
          "linear-gradient(135deg, #6b7280 0%, #4b5261 18%, #383e4a 38%, #2a2e38 58%, #191b21 80%, #0a0b0e 100%)",
        boxShadow:
          "0 24px 48px -18px rgba(15,23,42,0.55), 0 8px 20px -8px rgba(15,23,42,0.4), inset 0 1px 0 rgba(255,255,255,0.06)",
      }}
    >
      {/* subtle border ring */}
      <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-inset ring-white/10" />

      {/* brushed titanium streaks */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.5]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(100deg, rgba(255,255,255,0.05) 0px, rgba(255,255,255,0.05) 1px, transparent 1px, transparent 3px)",
        }}
      />

      {/* ambient ligth glows */}
      <div className="pointer-events-none absolute -top-24 -right-10 w-[216px] h-[216px] rounded-full bg-white/[0.06] blur-3xl" />
      <div className="pointer-events-none absolute -bottom-28 -left-16 w-[192px] h-[192px] rounded-full bg-black/30 blur-3xl" />

      {/* top glass reflection band */}
      <div
        className="pointer-events-none absolute -inset-y-10 -inset-x-4 rotate-[8deg]"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.16) 42%, rgba(255,255,255,0.22) 48%, rgba(255,255,255,0.16) 54%, transparent 100%)",
          top: "-40%",
          height: "55%",
        }}
      />

      {/* iridescent sheen — appears on hover, like a physical holo card catching light */}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-40 transition-opacity duration-500 mix-blend-color-dodge"
        style={{
          background:
            "linear-gradient(115deg, transparent 20%, #7dd3fc 32%, #c084fc 42%, #f472b6 50%, #fbbf24 58%, transparent 72%)",
        }}
      />

      {/* fine grain */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.05] mix-blend-overlay"
        style={{
          backgroundImage: "repeating-linear-gradient(0deg, #fff 0px, transparent 1px, transparent 3px)",
        }}
      />

      <div className="relative flex items-center justify-between">
        <p className="text-slate-300 text-[11px] font-medium">Tổng số dư</p>
        <div className="flex items-center gap-[6px]">
          <Wifi size={14} className="rotate-90 text-slate-300" />
          <button
            onClick={() => setVisible((v) => !v)}
            className="text-slate-300 hover:text-white transition-colors"
            aria-label={visible ? "Ẩn số dư" : "Hiện số dư"}
          >
            {visible ? <Eye size={13} /> : <EyeOff size={13} />}
          </button>
        </div>
      </div>

      <div className="relative mt-[9px] h-[28px]">
        <p
          className="absolute inset-0 text-[24px] font-semibold tracking-tight tabular-nums transition-opacity duration-300 ease-out"
          style={{ opacity: visible ? 1 : 0 }}
          aria-hidden={!visible}
        >
          {animatedBalance.toLocaleString("vi-VN")} ₫
        </p>
        <p
          className="absolute inset-0 text-[24px] font-semibold tracking-[0.3em] transition-opacity duration-300 ease-out select-none"
          style={{ opacity: visible ? 0 : 1 }}
          aria-hidden={visible}
        >
          •••• •••• ••••
        </p>
        <span className="sr-only">{visible ? `${balance.toLocaleString("vi-VN")} ₫` : "Số dư đã ẩn"}</span>
      </div>

      {/* chip */}
      <div className="relative mt-[15px]">
        <div
          className="w-[30px] h-[24px] rounded-md relative overflow-hidden"
          style={{
            background: "linear-gradient(155deg, #f4e5b3 0%, #d9bd7a 35%, #b8944f 70%, #8f6f39 100%)",
            boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.15)",
          }}
        >
          <div className="absolute inset-0 grid grid-cols-3 grid-rows-2 gap-[1px] p-[3px]">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-black/10 rounded-[1px]" />
            ))}
          </div>
        </div>
      </div>

      <div className="relative mt-[15px] flex items-end justify-between">
        <div>
          <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-[3px]">Số thẻ</p>
          <p className="font-card-mono font-medium text-[13px] tracking-[0.15em] text-slate-100">
            •••• •••• •••• {last4}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-[3px]">Hết hạn</p>
          <p className="font-card-mono font-medium text-[12px] text-slate-100">{mockUser.cardExpiry}</p>
        </div>
      </div>

      <div className="relative mt-[12px] flex items-center justify-between">
        <p className="text-[10px] text-slate-300 tracking-wide">{mockUser.fullName.toUpperCase()}</p>
        <div className="flex items-center -space-x-3">
          <span className="w-[21px] h-[21px] rounded-full bg-red-500/90" />
          <span className="w-[21px] h-[21px] rounded-full bg-amber-400/85 mix-blend-screen" />
        </div>
      </div>
    </div>
  );
}
