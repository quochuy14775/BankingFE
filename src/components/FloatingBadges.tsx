import { ShieldCheck, Zap, Lock, TrendingUp, type LucideIcon } from "lucide-react";

interface Badge {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  side: "left" | "right";
  top: string;
  delay: string;
  accent: string;
}

const badges: Badge[] = [
  {
    icon: ShieldCheck,
    title: "Bảo mật 256-bit",
    subtitle: "Mã hóa đầu-cuối",
    side: "left",
    top: "8%",
    delay: "0s",
    accent: "text-emerald-600 bg-emerald-50",
  },
  {
    icon: Zap,
    title: "Chuyển tiền tức thì",
    subtitle: "24/7 · 365 ngày",
    side: "right",
    top: "18%",
    delay: "0.6s",
    accent: "text-amber-600 bg-amber-50",
  },
  {
    icon: Lock,
    title: "Xác thực OTP",
    subtitle: "Mọi giao dịch",
    side: "left",
    top: "48%",
    delay: "1.2s",
    accent: "text-indigo-600 bg-indigo-50",
  },
  {
    icon: TrendingUp,
    title: "1.2M+ giao dịch",
    subtitle: "Thành công / ngày",
    side: "right",
    top: "58%",
    delay: "0.3s",
    accent: "text-sky-600 bg-sky-50",
  },
];

export default function FloatingBadges() {
  return (
    <div className="pointer-events-none absolute inset-0 hidden 2xl:block">
      {badges.map((b, i) => {
        const Icon = b.icon;
        return (
          <div
            key={i}
            className="absolute animate-float w-[156px] rounded-2xl bg-white/80 backdrop-blur-xl border border-black/5 shadow-[0_8px_24px_rgba(0,0,0,0.06)] p-[12px]"
            style={{
              top: b.top,
              [b.side]: "3%",
              animationDelay: b.delay,
            }}
          >
            <div className="flex items-center gap-[9px]">
              <span className={`w-[27px] h-[27px] rounded-full flex items-center justify-center shrink-0 ${b.accent}`}>
                <Icon size={12} />
              </span>
              <div className="min-w-0">
                <p className="text-[10px] font-semibold text-slate-800 truncate">{b.title}</p>
                <p className="text-[10px] text-slate-400 truncate">{b.subtitle}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
