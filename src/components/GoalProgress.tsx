import { useEffect, useRef, useState } from "react";
import { formatVND } from "../lib/mockData.ts";

export function useCountUp(target: number, durationMs = 900) {
  const [value, setValue] = useState(0);
  const frame = useRef<number>(0);

  useEffect(() => {
    const start = performance.now();
    const from = 0;

    function tick(now: number) {
      const t = Math.min((now - start) / durationMs, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(from + (target - from) * eased);
      if (t < 1) frame.current = requestAnimationFrame(tick);
    }

    frame.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame.current);
  }, [target, durationMs]);

  return value;
}

interface AnimatedProgressBarProps {
  pct: number;
  isDone?: boolean;
}

export function AnimatedProgressBar({ pct, isDone = false }: AnimatedProgressBarProps) {
  return (
    <div className="relative h-[6px] rounded-full bg-slate-100 overflow-visible">
      <div className="h-full rounded-full overflow-hidden">
        <div
          className={`h-full ${isDone ? "bg-emerald-500" : "bg-slate-900"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2" style={{ left: `${pct}%` }}>
        <span className={`absolute inset-0 w-[9px] h-[9px] rounded-full animate-ping ${isDone ? "bg-emerald-500/40" : "bg-slate-900/40"}`} />
        <span
          className={`relative block w-[9px] h-[9px] rounded-full ring-2 ring-white shadow-[0_0_6px_rgba(15,23,42,0.5)] ${
            isDone ? "bg-emerald-500" : "bg-slate-900"
          }`}
        />
      </div>
    </div>
  );
}

interface GoalProgressProps {
  name: string;
  current: number;
  target: number;
}

export default function GoalProgress({ name, current, target }: GoalProgressProps) {
  const animatedCurrent = useCountUp(current);
  const pct = Math.min((animatedCurrent / target) * 100, 100);
  const isDone = current >= target;

  return (
    <div>
      <div className="flex items-center justify-between text-[11px] mb-[6px]">
        <span className="font-medium text-slate-700">{name}</span>
        <span className={`font-semibold tabular-nums transition-colors duration-300 ${isDone ? "text-emerald-600" : "text-slate-400"}`}>
          {Math.round(pct)}%
        </span>
      </div>

      <AnimatedProgressBar pct={pct} isDone={isDone} />

      <p className="text-[10px] text-slate-400 mt-[4px] tabular-nums">
        {formatVND(Math.round(animatedCurrent))} / {formatVND(target)}
      </p>
    </div>
  );
}
