import { useEffect, useRef, useState } from "react";
import { formatVND, type SpendingPoint } from "../lib/mockData.ts";

interface SpendingChartProps {
  data: SpendingPoint[];
}

const HEIGHT = 120;
const PADDING = 8;

function smoothPath(points: { x: number; y: number }[]): string {
  if (points.length < 2) return "";
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }
  return d;
}

export default function SpendingChart({ data }: SpendingChartProps) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const lineRef = useRef<SVGPathElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [drawn, setDrawn] = useState(false);
  const [width, setWidth] = useState(400);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width;
      if (w) setWidth(w);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const max = Math.max(...data.map((d) => d.amount));
  const min = Math.min(...data.map((d) => d.amount));
  const range = max - min || 1;
  const peakIndex = data.findIndex((d) => d.amount === max);

  const points = data.map((d, i) => {
    const x = PADDING + (i / (data.length - 1)) * (width - PADDING * 2);
    const y = HEIGHT - PADDING - ((d.amount - min) / range) * (HEIGHT - PADDING * 2);
    return { x, y, ...d };
  });

  const linePath = smoothPath(points);
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${HEIGHT} L ${points[0].x} ${HEIGHT} Z`;

  useEffect(() => {
    const el = lineRef.current;
    if (!el) return;
    const length = el.getTotalLength();
    el.style.strokeDasharray = `${length}`;
    el.style.strokeDashoffset = `${length}`;
    el.getBoundingClientRect();
    const frame = requestAnimationFrame(() => {
      el.style.transition = "stroke-dashoffset 1s cubic-bezier(0.16, 1, 0.3, 1)";
      el.style.strokeDashoffset = "0";
      setDrawn(true);
    });
    return () => cancelAnimationFrame(frame);
  }, [data]);

  const activeIndex = hoverIndex ?? peakIndex;
  const active = points[activeIndex];

  return (
    <div className="bg-white rounded-3xl border border-black/5 p-[15px] shadow-[0_1px_2px_rgba(0,0,0,0.04)] h-full">
      <div className="flex items-center justify-between mb-[15px]">
        <h2 className="text-[13px] font-semibold text-slate-900 tracking-tight">Chi tiêu 7 ngày qua</h2>
        <span className="text-[11px] font-semibold text-slate-900 tabular-nums">{formatVND(active.amount)}</span>
      </div>

      <div ref={containerRef} className="relative">
        <svg viewBox={`0 0 ${width} ${HEIGHT}`} className="w-full overflow-visible" style={{ height: HEIGHT }}>
          <defs>
            <linearGradient id="spendFillLight" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#a78bfa" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="spendStrokeLight" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#818cf8" />
              <stop offset="100%" stopColor="#c026d3" />
            </linearGradient>
            <radialGradient id="travelGlow">
              <stop offset="0%" stopColor="#fff" stopOpacity="1" />
              <stop offset="40%" stopColor="#e9d5ff" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#c026d3" stopOpacity="0" />
            </radialGradient>
          </defs>

          <path
            d={areaPath}
            fill="url(#spendFillLight)"
            className="transition-opacity duration-700"
            style={{ opacity: drawn ? 1 : 0 }}
          />
          <path
            ref={lineRef}
            d={linePath}
            fill="none"
            stroke="url(#spendStrokeLight)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* ambient light traveling along the line, with a breathing pulse */}
          {drawn && (
            <circle r="5" fill="url(#travelGlow)" style={{ mixBlendMode: "screen" }}>
              <animateMotion dur="3.2s" repeatCount="indefinite" path={linePath} rotate="auto" />
              <animate attributeName="r" values="4;7;4" dur="1.6s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.5;1;0.5" dur="1.6s" repeatCount="indefinite" />
            </circle>
          )}

          {points.map((p, i) => (
            <g key={i}>
              <rect
                x={p.x - width / data.length / 2}
                y={0}
                width={width / data.length}
                height={HEIGHT}
                fill="transparent"
                onMouseEnter={() => setHoverIndex(i)}
                onMouseLeave={() => setHoverIndex(null)}
                className="cursor-pointer"
              />

              {i === activeIndex && (
                <line x1={p.x} y1={p.y} x2={p.x} y2={HEIGHT} stroke="#818cf8" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.4" />
              )}

              <circle
                cx={p.x}
                cy={p.y}
                r={i === activeIndex ? 5.5 : 3}
                fill="#7c3aed"
                stroke="#fff"
                strokeWidth={i === activeIndex ? 2 : 0}
                className="transition-all duration-200 pointer-events-none animate-dot-in"
                style={{
                  opacity: drawn ? 1 : 0,
                  animationDelay: `${0.9 + i * 0.06}s`,
                  transformOrigin: `${p.x}px ${p.y}px`,
                }}
              />
            </g>
          ))}
        </svg>

        <div
          className="absolute -top-2 px-[8px] py-[3px] rounded-lg bg-slate-900 text-white text-[10px] font-semibold whitespace-nowrap shadow-lg transition-all duration-150"
          style={{
            left: `${(active.x / width) * 100}%`,
            transform:
              activeIndex === 0
                ? "translate(0%, -100%)"
                : activeIndex === data.length - 1
                  ? "translate(-100%, -100%)"
                  : "translate(-50%, -100%)",
          }}
        >
          {formatVND(active.amount)}
        </div>

        <div className="flex justify-between mt-[6px] px-[3px]">
          {data.map((d, i) => (
            <span
              key={i}
              className={`text-[10px] font-medium transition-colors ${
                i === activeIndex ? "text-slate-900" : "text-slate-400"
              }`}
            >
              {d.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
