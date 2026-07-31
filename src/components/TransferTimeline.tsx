import { Check, FileText, ShieldCheck, PartyPopper, type LucideIcon } from "lucide-react";

export type TransferStep = "form" | "confirm" | "otp" | "success";

interface StepDef {
  key: TransferStep;
  label: string;
  icon: LucideIcon;
}

const steps: StepDef[] = [
  { key: "form", label: "Thông tin", icon: FileText },
  { key: "confirm", label: "Xác nhận", icon: Check },
  { key: "otp", label: "Xác thực OTP", icon: ShieldCheck },
  { key: "success", label: "Hoàn tất", icon: PartyPopper },
];

export default function TransferTimeline({ current }: { current: TransferStep }) {
  const currentIndex = steps.findIndex((s) => s.key === current);

  return (
    <div className="flex items-center">
      {steps.map((s, i) => {
        const isDone = i < currentIndex;
        const isActive = i === currentIndex;
        const Icon = s.icon;

        return (
          <div key={s.key} className={`flex items-center ${i < steps.length - 1 ? "flex-1" : ""}`}>
            <div className="flex flex-col items-center">
              <div
                className={`w-[30px] h-[30px] rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                  isDone
                    ? "text-white border-transparent shadow-[0_4px_14px_-4px_rgba(192,38,211,0.5)]"
                    : isActive
                      ? "bg-white border-fuchsia-500 text-fuchsia-600 shadow-[0_0_0_4px_rgba(192,38,211,0.1)]"
                      : "bg-white border-slate-200 text-slate-300"
                }`}
                style={isDone ? { background: "linear-gradient(135deg, #818cf8, #c026d3)" } : undefined}
              >
                {isDone ? <Check size={12} /> : <Icon size={12} />}
              </div>
              <span
                className={`mt-[6px] text-[10px] font-medium whitespace-nowrap transition-colors duration-300 ${
                  isActive ? "text-fuchsia-600" : isDone ? "text-slate-600" : "text-slate-300"
                }`}
              >
                {s.label}
              </span>
            </div>

            {i < steps.length - 1 && (
              <div className="flex-1 h-[2px] mx-[6px] -mt-5 rounded-full bg-slate-200 overflow-hidden">
                <div
                  className="h-full transition-all duration-500 ease-out"
                  style={{ width: isDone ? "100%" : "0%", background: "linear-gradient(90deg, #818cf8, #c026d3)" }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
