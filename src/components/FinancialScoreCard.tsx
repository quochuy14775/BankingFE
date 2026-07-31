import { useEffect, useState } from "react";
import { CheckCircle2, AlertTriangle, ArrowRight } from "lucide-react";

interface ChecklistItem {
  label: string;
  ok: boolean;
}

interface FinancialScoreCardProps {
  score?: number;
  maxScore?: number;
  items?: ChecklistItem[];
}

const RADIUS = 46;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function useCountUp(target: number, duration = 1200) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    const start = performance.now();
    let frame = 0;
    function tick(now: number) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(target * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
    }
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, duration]);
  return value;
}

const defaultItems: ChecklistItem[] = [
  { label: "Chi tiêu hợp lý", ok: true },
  { label: "Tiết kiệm đều đặn", ok: true },
  { label: "Chi tiêu giải trí tăng 20%", ok: false },
];

export default function FinancialScoreCard({ score = 83, maxScore = 100, items = defaultItems }: FinancialScoreCardProps) {
  const animatedScore = useCountUp(score);
  const offset = CIRCUMFERENCE * (1 - animatedScore / maxScore);
  const status = score >= 70 ? "Tốt" : score >= 40 ? "Trung bình" : "Cần cải thiện";

  const angle = (score / maxScore) * 2 * Math.PI;
  const tipX = 56 + RADIUS * Math.cos(angle);
  const tipY = 56 + RADIUS * Math.sin(angle);
  const largeArc = angle > Math.PI ? 1 : 0;
  const arcPath = `M ${56 + RADIUS} 56 A ${RADIUS} ${RADIUS} 0 ${largeArc} 1 ${tipX} ${tipY}`;

  return (
    <div className="bg-white rounded-3xl border border-black/5 p-[15px] shadow-[0_1px_2px_rgba(0,0,0,0.04)] h-full">
      <div className="flex items-center justify-between mb-[15px]">
        <h2 className="text-[13px] font-semibold text-slate-900 tracking-tight">Điểm sức khỏe tài chính</h2>
        <span className="px-[8px] py-[3px] rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-semibold">
          {status}
        </span>
      </div>

      <div className="flex items-center gap-[18px]">
        <svg width={112} height={112} viewBox="0 0 112 112" className="-rotate-90 shrink-0">
          <circle cx={56} cy={56} r={RADIUS} fill="none" stroke="#f1f0fb" strokeWidth="10" />
          <circle
            cx={56}
            cy={56}
            r={RADIUS}
            fill="none"
            stroke="url(#scoreGradient)"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.16, 1, 0.3, 1)" }}
          />
          <defs>
            <linearGradient id="scoreGradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#818cf8" />
              <stop offset="100%" stopColor="#c026d3" />
            </linearGradient>
            <radialGradient id="scoreTravelGlow">
              <stop offset="0%" stopColor="#fff" stopOpacity="1" />
              <stop offset="40%" stopColor="#e9d5ff" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#c026d3" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* light traveling along the arc from start to the current score, with a breathing pulse */}
          <circle r="6" fill="url(#scoreTravelGlow)" style={{ mixBlendMode: "screen" }}>
            <animateMotion dur="2.4s" repeatCount="indefinite" path={arcPath} rotate="auto" />
            <animate attributeName="r" values="5;8;5" dur="1.6s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.5;1;0.5" dur="1.6s" repeatCount="indefinite" />
          </circle>

          {/* breathing glow at the tip of the progress arc */}
          <circle
            cx={tipX}
            cy={tipY}
            r="5"
            fill="#c026d3"
            opacity="0.5"
            style={{ transformOrigin: `${tipX}px ${tipY}px` }}
            className="animate-ping"
          />
          <circle cx={tipX} cy={tipY} r="4" fill="#fff" stroke="#c026d3" strokeWidth="2" />
          <text
            x={56}
            y={50}
            textAnchor="middle"
            className="rotate-90"
            style={{ transformOrigin: "56px 56px", fill: "#0f172a", fontSize: "28px", fontWeight: 700 }}
          >
            {animatedScore}
          </text>
          <text
            x={56}
            y={70}
            textAnchor="middle"
            className="rotate-90"
            style={{ transformOrigin: "56px 56px", fill: "#94a3b8", fontSize: "12px", fontWeight: 500 }}
          >
            /{maxScore}
          </text>
        </svg>

        <div className="flex-1 min-w-0">
          <p className="text-[11px] text-slate-500 mb-[9px]">Bạn đang quản lý tài chính rất tốt!</p>
          <ul className="space-y-[6px]">
            {items.map((item, i) => (
              <li key={i} className="flex items-center gap-[6px] text-[11px]">
                {item.ok ? (
                  <CheckCircle2 size={11} className="text-emerald-500 shrink-0" />
                ) : (
                  <AlertTriangle size={11} className="text-amber-500 shrink-0" />
                )}
                <span className={item.ok ? "text-slate-700" : "text-amber-700"}>{item.label}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <button className="w-full mt-[15px] flex items-center justify-center gap-[4px] py-[8px] rounded-2xl bg-slate-50 hover:bg-slate-100 text-[11px] font-medium text-slate-700 transition-colors">
        Xem chi tiết <ArrowRight size={10} />
      </button>
    </div>
  );
}
