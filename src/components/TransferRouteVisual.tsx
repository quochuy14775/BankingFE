import { Landmark, Check } from "lucide-react";
import { formatVND, type Contact } from "../lib/mockData.ts";

interface TransferRouteVisualProps {
  fromLabel: string;
  toContact: Contact | null;
  amount: number;
  isComplete: boolean;
}

export default function TransferRouteVisual({ fromLabel, toContact, amount, isComplete }: TransferRouteVisualProps) {
  return (
    <div className="relative bg-white rounded-3xl border border-black/5 p-[15px] shadow-[0_1px_2px_rgba(0,0,0,0.04)] overflow-hidden">
      {/* ambient glow */}
      <div className="pointer-events-none absolute -top-16 left-1/3 w-[192px] h-[192px] rounded-full bg-indigo-100/50 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 right-1/4 w-[192px] h-[192px] rounded-full bg-sky-100/50 blur-3xl" />

      <div className="relative flex items-center justify-center gap-[12px] sm:gap-[24px]">
        {/* From node */}
        <div className="flex flex-col items-center gap-[6px] shrink-0">
          <div className="w-[42px] h-[42px] rounded-2xl bg-gradient-to-br from-slate-800 to-slate-950 text-white flex items-center justify-center shadow-[0_10px_24px_-8px_rgba(15,23,42,0.5)]">
            <Landmark size={16} />
          </div>
          <p className="text-[10px] font-medium text-slate-700 text-center max-w-[75px] truncate">{fromLabel}</p>
        </div>

        {/* Connecting path */}
        <div className="relative flex-1 max-w-[165px] h-[2px]">
          <div className="absolute inset-0 rounded-full bg-slate-200" />
          <div
            className={`absolute inset-y-0 left-0 rounded-full bg-slate-900 transition-all duration-700 ease-out ${
              isComplete ? "w-full" : "w-0"
            }`}
          />
          {!isComplete && (
            <div className="absolute inset-0 overflow-hidden rounded-full">
              <div className="absolute top-1/2 -translate-y-1/2 w-[9px] h-[9px] rounded-full bg-slate-900 shadow-[0_0_8px_rgba(15,23,42,0.5)] animate-travel-dot" />
            </div>
          )}
          {amount > 0 && (
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap px-[8px] py-[3px] rounded-full bg-slate-900 text-white text-[10px] font-semibold shadow-sm">
              {formatVND(amount)}
            </div>
          )}
        </div>

        {/* To node */}
        <div className="flex flex-col items-center gap-[6px] shrink-0">
          <div
            className={`w-[42px] h-[42px] rounded-2xl flex items-center justify-center text-[13px] font-semibold transition-all duration-300 ${
              isComplete
                ? "bg-emerald-500 text-white shadow-[0_10px_24px_-8px_rgba(16,185,129,0.5)]"
                : toContact
                  ? "bg-slate-100 text-slate-700"
                  : "bg-slate-50 text-slate-300 border-2 border-dashed border-slate-200"
            }`}
          >
            {isComplete ? <Check size={16} /> : toContact ? toContact.name.split(" ").pop()?.[0] : "?"}
          </div>
          <p className="text-[10px] font-medium text-slate-700 text-center max-w-[75px] truncate">
            {toContact ? toContact.name : "Người nhận"}
          </p>
        </div>
      </div>
    </div>
  );
}
