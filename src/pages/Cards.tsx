import { useEffect, useRef, useState, type CSSProperties, type FormEvent } from "react";
import { Lock, Unlock, KeyRound, Plus, Trash2, CreditCard as CreditCardIcon, Eye, EyeOff, Wifi, X } from "lucide-react";
import { useCards, type BankCardData } from "../lib/cardStore.tsx";
import { formatVND } from "../lib/mockData.ts";

const NETWORK_LABELS: Record<BankCardData["network"], string> = {
  visa: "Visa",
  mastercard: "Mastercard",
  napas: "Napas",
};

function NetworkLogo({ network }: { network: BankCardData["network"] }) {
  if (network === "visa") {
    return <span className="italic font-bold text-[19px] tracking-tight text-white">VISA</span>;
  }
  if (network === "mastercard") {
    return (
      <div className="flex items-center -space-x-[10px]">
        <span className="w-[24px] h-[24px] rounded-full bg-red-500/90" />
        <span className="w-[24px] h-[24px] rounded-full bg-amber-400/85 mix-blend-screen" />
      </div>
    );
  }
  return (
    <span className="font-bold text-[15px] tracking-tight text-white">
      napas
    </span>
  );
}

function CardFace({
  card,
  isSub,
  showNumber,
  onToggleShowNumber,
  className = "",
}: {
  card: BankCardData;
  isSub?: boolean;
  showNumber: boolean;
  onToggleShowNumber: () => void;
  className?: string;
}) {
  const groups = card.number.split(" ");
  const maskedGroups = groups.map((g, i) => (i === groups.length - 1 ? g : "••••"));

  return (
    <div
      className={`group relative rounded-[16px] p-[16px] flex flex-col justify-between overflow-hidden text-white transition-all duration-300 ${
        card.locked ? "grayscale opacity-70" : ""
      } ${className}`}
      style={{
        background: isSub
          ? "linear-gradient(135deg, #64748b 0%, #475569 30%, #334155 60%, #1e293b 85%, #0f172a 100%)"
          : card.type === "credit"
          ? "linear-gradient(135deg, #8b6fff 0%, #7c5cff 20%, #5b3fd6 45%, #3d2a9e 70%, #1f1550 100%)"
          : "linear-gradient(135deg, #6b7280 0%, #4b5261 18%, #383e4a 38%, #2a2e38 58%, #191b21 80%, #0a0b0e 100%)",
        boxShadow: "0 20px 40px -16px rgba(15,23,42,0.55), 0 6px 16px -6px rgba(15,23,42,0.4), inset 0 1px 0 rgba(255,255,255,0.08)",
      }}
    >
      <div className="pointer-events-none absolute inset-0 rounded-[16px] ring-1 ring-inset ring-white/10" />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.45]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(100deg, rgba(255,255,255,0.05) 0px, rgba(255,255,255,0.05) 1px, transparent 1px, transparent 3px)",
        }}
      />
      <div className="pointer-events-none absolute -top-16 -right-8 w-[140px] h-[140px] rounded-full bg-white/[0.07] blur-3xl" />
      <div
        className="pointer-events-none absolute -inset-y-10 -inset-x-4 rotate-[8deg] opacity-70"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.14) 42%, rgba(255,255,255,0.2) 48%, rgba(255,255,255,0.14) 54%, transparent 100%)",
          top: "-40%",
          height: "55%",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-35 transition-opacity duration-500 mix-blend-color-dodge"
        style={{
          background:
            "linear-gradient(115deg, transparent 20%, #7dd3fc 32%, #c084fc 42%, #f472b6 50%, #fbbf24 58%, transparent 72%)",
        }}
      />

      {/* Top row: chip + type label + eye/lock */}
      <div className="relative flex items-start justify-between">
        <div
          className="w-[34px] h-[26px] rounded-[5px] relative overflow-hidden shrink-0"
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

        <div className="flex items-center gap-[8px]">
          <Wifi size={15} className="rotate-90 text-white/70" />
          {card.locked ? (
            <span className="flex items-center gap-[3px] px-[7px] py-[3px] rounded-full bg-red-500/25 text-red-100 text-[9px] font-medium">
              <Lock size={9} /> Đã khóa
            </span>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleShowNumber();
              }}
              className="text-white/70 hover:text-white transition-colors"
              aria-label={showNumber ? "Ẩn số thẻ" : "Hiện số thẻ"}
            >
              {showNumber ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          )}
        </div>
      </div>

      <p className="relative text-[9px] font-medium text-white/50 uppercase tracking-wider -mt-[6px]">
        {card.type === "credit" ? "Thẻ tín dụng" : "Thẻ ghi nợ"} {isSub && "· Thẻ phụ"}
      </p>

      {/* Card number */}
      <p className="relative font-card-mono font-medium text-[16px] sm:text-[17px] tracking-[0.12em]">
        {showNumber && !card.locked ? groups.join(" ") : maskedGroups.join(" ")}
      </p>

      {/* Bottom row: holder / expiry / network */}
      <div className="relative flex items-end justify-between">
        <div className="min-w-0">
          <p className="text-[8px] text-white/45 uppercase tracking-wider mb-[2px]">Chủ thẻ</p>
          <p className="text-[11px] font-medium tracking-wide truncate max-w-[150px]">{card.holder.toUpperCase()}</p>
        </div>
        <div className="text-right shrink-0 mr-[10px]">
          <p className="text-[8px] text-white/45 uppercase tracking-wider mb-[2px]">Hết hạn</p>
          <p className="font-card-mono text-[11px]">{card.expiry}</p>
        </div>
        <div className="shrink-0">
          <NetworkLogo network={card.network} />
        </div>
      </div>
    </div>
  );
}

function CardTile({
  card,
  onToggleLock,
  onOpenPin,
  onOpenSub,
  onRemove,
  onExpand,
  isSub,
}: {
  card: BankCardData;
  onToggleLock: () => void;
  onOpenPin: () => void;
  onOpenSub?: () => void;
  onRemove?: () => void;
  onExpand: (el: HTMLDivElement) => void;
  isSub?: boolean;
}) {
  const [showNumber, setShowNumber] = useState(false);
  const faceRef = useRef<HTMLDivElement>(null);

  return (
    <div className="flex flex-col gap-[10px]">
      <div
        ref={faceRef}
        onClick={() => faceRef.current && onExpand(faceRef.current)}
        className="w-full max-w-[340px] mx-auto aspect-[85.6/53.98] cursor-zoom-in transition-transform duration-200 hover:scale-[1.02] hover:shadow-[0_28px_50px_-16px_rgba(15,23,42,0.6)] rounded-[16px]"
      >
        <CardFace card={card} isSub={isSub} showNumber={showNumber} onToggleShowNumber={() => setShowNumber((v) => !v)} className="w-full h-full" />
      </div>

      {card.type === "credit" && card.creditLimit && (
        <p className="text-center text-[10px] text-slate-500">
          Hạn mức: <span className="font-semibold text-slate-700">{formatVND(card.creditLimit)}</span>
        </p>
      )}

      {/* Actions */}
      <div className="flex items-center gap-[6px] flex-wrap justify-center">
        <button
          onClick={onToggleLock}
          className={`flex items-center gap-[4px] px-[10px] py-[5px] rounded-full text-[10px] font-medium transition-colors ${
            card.locked ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100" : "bg-slate-100 text-slate-600 hover:bg-slate-200/70"
          }`}
        >
          {card.locked ? <Unlock size={11} /> : <Lock size={11} />}
          {card.locked ? "Mở thẻ" : "Khóa thẻ"}
        </button>
        <button
          onClick={onOpenPin}
          className="flex items-center gap-[4px] px-[10px] py-[5px] rounded-full bg-slate-100 hover:bg-slate-200/70 text-slate-600 text-[10px] font-medium transition-colors"
        >
          <KeyRound size={11} />
          Đổi PIN
        </button>
        {onOpenSub && (
          <button
            onClick={onOpenSub}
            className="flex items-center gap-[4px] px-[10px] py-[5px] rounded-full bg-slate-100 hover:bg-slate-200/70 text-slate-600 text-[10px] font-medium transition-colors"
          >
            <Plus size={11} />
            Thẻ phụ
          </button>
        )}
        {onRemove && (
          <button
            onClick={onRemove}
            className="flex items-center gap-[4px] px-[10px] py-[5px] rounded-full bg-slate-100 hover:bg-red-50 text-slate-500 hover:text-red-500 text-[10px] font-medium transition-colors"
          >
            <Trash2 size={11} />
          </button>
        )}
      </div>
    </div>
  );
}

export default function Cards() {
  const { cards, toggleLock, changePin, addSubCard, removeCard } = useCards();
  const [pinCardId, setPinCardId] = useState<string | null>(null);
  const [pinValue, setPinValue] = useState("");
  const [pinConfirm, setPinConfirm] = useState("");
  const [pinError, setPinError] = useState("");
  const [pinToast, setPinToast] = useState<string | null>(null);

  const [subParentId, setSubParentId] = useState<string | null>(null);
  const [subHolder, setSubHolder] = useState("");
  const [subError, setSubError] = useState("");

  const [focusCard, setFocusCard] = useState<{ card: BankCardData; isSub: boolean; origin: DOMRect } | null>(null);
  const [focusExpanded, setFocusExpanded] = useState(false);
  const [focusShowNumber, setFocusShowNumber] = useState(true);

  const mainCards = cards.filter((c) => c.parentId === null);
  const subCardsFor = (id: string) => cards.filter((c) => c.parentId === id);

  function expandCard(card: BankCardData, isSub: boolean, el: HTMLDivElement) {
    const origin = el.getBoundingClientRect();
    setFocusCard({ card, isSub, origin });
    setFocusExpanded(false);
    setFocusShowNumber(true);
    setTimeout(() => setFocusExpanded(true), 20);
  }

  function closeFocus() {
    setFocusExpanded(false);
    setTimeout(() => setFocusCard(null), 320);
  }

  useEffect(() => {
    if (!focusCard) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") closeFocus();
    }
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusCard]);

  function openPinModal(id: string) {
    setPinCardId(id);
    setPinValue("");
    setPinConfirm("");
    setPinError("");
  }

  function submitPin(e: FormEvent) {
    e.preventDefault();
    if (!/^\d{4,6}$/.test(pinValue)) {
      setPinError("PIN phải gồm 4-6 chữ số.");
      return;
    }
    if (pinValue !== pinConfirm) {
      setPinError("Xác nhận PIN không khớp.");
      return;
    }
    if (pinCardId) {
      changePin(pinCardId, pinValue);
      setPinToast("Đổi mã PIN thành công.");
      setTimeout(() => setPinToast(null), 3000);
    }
    setPinCardId(null);
  }

  function submitSubCard(e: FormEvent) {
    e.preventDefault();
    const trimmed = subHolder.trim();
    if (!trimmed) {
      setSubError("Vui lòng nhập tên chủ thẻ phụ.");
      return;
    }
    if (subParentId) addSubCard(subParentId, trimmed);
    setSubHolder("");
    setSubError("");
    setSubParentId(null);
  }

  return (
    <>
      <div className="pointer-events-none fixed top-[60px] left-1/5 w-[288px] h-[288px] rounded-full bg-indigo-200/15 blur-3xl -z-10 animate-ambient-pulse" />
      <div
        className="pointer-events-none fixed bottom-[30px] right-1/5 w-[288px] h-[288px] rounded-full bg-sky-200/15 blur-3xl -z-10 animate-ambient-pulse"
        style={{ animationDelay: "3s" }}
      />

      <h1 className="text-[22px] font-semibold text-slate-900 tracking-tight mb-[3px]">Quản lý thẻ</h1>
      <p className="text-slate-500 mb-[18px] text-[13px]">
        Khóa/mở thẻ tạm thời, đổi mã PIN và quản lý thẻ phụ được cấp cho người thân.
      </p>

      {pinToast && (
        <div className="mb-[12px] flex items-center gap-[8px] px-[14px] py-[10px] rounded-2xl bg-emerald-50 text-emerald-700 text-[12px] font-medium">
          <KeyRound size={14} />
          {pinToast}
        </div>
      )}

      <div className="space-y-[18px]">
        {mainCards.map((card) => {
          const subs = subCardsFor(card.id);
          return (
            <div key={card.id} className="bg-white rounded-3xl border border-black/5 p-[15px] shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-[12px]">
                <CardTile
                  card={card}
                  onToggleLock={() => toggleLock(card.id)}
                  onOpenPin={() => openPinModal(card.id)}
                  onExpand={(el) => expandCard(card, false, el)}
                  onOpenSub={() => {
                    setSubParentId(card.id);
                    setSubHolder("");
                    setSubError("");
                  }}
                />
                <div className="space-y-[10px]">
                  <p className="flex items-center gap-[6px] text-[11px] font-medium text-slate-500">
                    <CreditCardIcon size={12} />
                    Thẻ phụ ({subs.length})
                  </p>
                  {subs.length === 0 ? (
                    <p className="text-[11px] text-slate-400 py-[10px]">Chưa có thẻ phụ nào được cấp.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-[10px]">
                      {subs.map((sub) => (
                        <CardTile
                          key={sub.id}
                          card={sub}
                          isSub
                          onToggleLock={() => toggleLock(sub.id)}
                          onOpenPin={() => openPinModal(sub.id)}
                          onExpand={(el) => expandCard(sub, true, el)}
                          onRemove={() => removeCard(sub.id)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Change PIN modal */}
      {pinCardId && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/30 backdrop-blur-sm px-[16px]">
          <div className="bg-white rounded-3xl border border-black/5 shadow-[0_20px_60px_rgba(0,0,0,0.2)] p-[20px] w-full max-w-[360px]">
            <h3 className="text-[15px] font-semibold text-slate-900 mb-[10px]">Đổi mã PIN</h3>
            <form onSubmit={submitPin} className="space-y-[10px]">
              <input
                type="password"
                inputMode="numeric"
                value={pinValue}
                onChange={(e) => setPinValue(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="Mã PIN mới (4-6 số)"
                className="w-full px-[12px] py-[9px] rounded-2xl bg-slate-100 border-0 text-[12px] font-medium text-slate-900 tracking-[0.2em] focus:outline-none focus:ring-2 focus:ring-slate-900/10"
              />
              <input
                type="password"
                inputMode="numeric"
                value={pinConfirm}
                onChange={(e) => setPinConfirm(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="Xác nhận mã PIN"
                className="w-full px-[12px] py-[9px] rounded-2xl bg-slate-100 border-0 text-[12px] font-medium text-slate-900 tracking-[0.2em] focus:outline-none focus:ring-2 focus:ring-slate-900/10"
              />
              {pinError && <p className="text-[11px] text-red-500 font-medium">{pinError}</p>}
              <div className="flex gap-[8px] pt-[4px]">
                <button
                  type="button"
                  onClick={() => setPinCardId(null)}
                  className="flex-1 py-[9px] rounded-2xl text-[12px] font-medium bg-slate-100 hover:bg-slate-200/70 text-slate-700 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 py-[9px] rounded-2xl text-[12px] font-medium bg-slate-900 hover:bg-slate-800 text-white transition-colors"
                >
                  Xác nhận
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add sub-card modal */}
      {subParentId && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/30 backdrop-blur-sm px-[16px]">
          <div className="bg-white rounded-3xl border border-black/5 shadow-[0_20px_60px_rgba(0,0,0,0.2)] p-[20px] w-full max-w-[360px]">
            <h3 className="text-[15px] font-semibold text-slate-900 mb-[10px]">Cấp thẻ phụ</h3>
            <form onSubmit={submitSubCard} className="space-y-[10px]">
              <input
                type="text"
                value={subHolder}
                onChange={(e) => setSubHolder(e.target.value)}
                placeholder="Tên chủ thẻ phụ"
                className="w-full px-[12px] py-[9px] rounded-2xl bg-slate-100 border-0 text-[12px] font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
              />
              {subError && <p className="text-[11px] text-red-500 font-medium">{subError}</p>}
              <div className="flex gap-[8px] pt-[4px]">
                <button
                  type="button"
                  onClick={() => setSubParentId(null)}
                  className="flex-1 py-[9px] rounded-2xl text-[12px] font-medium bg-slate-100 hover:bg-slate-200/70 text-slate-700 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 py-[9px] rounded-2xl text-[12px] font-medium bg-slate-900 hover:bg-slate-800 text-white transition-colors"
                >
                  Cấp thẻ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Focused card zoom overlay */}
      {focusCard &&
        (() => {
          const ratio = 85.6 / 53.98;
          const targetWidth = Math.min(440, window.innerWidth - 48);
          const targetHeight = targetWidth / ratio;
          const style: CSSProperties = focusExpanded
            ? {
                top: "50%",
                left: "50%",
                width: targetWidth,
                height: targetHeight,
                transform: "translate(-50%, -50%) scale(1)",
              }
            : {
                top: focusCard.origin.top,
                left: focusCard.origin.left,
                width: focusCard.origin.width,
                height: focusCard.origin.height,
                transform: "translate(0, 0) scale(1)",
              };
          return (
            <div className="fixed inset-0 z-40" role="dialog" aria-modal="true">
              <div
                onClick={closeFocus}
                className="absolute inset-0 bg-black/0 backdrop-blur-0 transition-all duration-300 ease-out"
                style={{
                  backgroundColor: focusExpanded ? "rgba(15,23,42,0.55)" : "rgba(15,23,42,0)",
                  backdropFilter: focusExpanded ? "blur(6px)" : "blur(0px)",
                }}
              />
              <button
                onClick={closeFocus}
                className="absolute top-[20px] right-[20px] w-[32px] h-[32px] rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all duration-300"
                style={{ opacity: focusExpanded ? 1 : 0, pointerEvents: focusExpanded ? "auto" : "none" }}
                aria-label="Đóng"
              >
                <X size={16} />
              </button>
              <div
                className="fixed rounded-[16px] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.5)]"
                style={{
                  ...style,
                  transition: "top 0.38s cubic-bezier(0.22,1,0.36,1), left 0.38s cubic-bezier(0.22,1,0.36,1), width 0.38s cubic-bezier(0.22,1,0.36,1), height 0.38s cubic-bezier(0.22,1,0.36,1), transform 0.38s cubic-bezier(0.22,1,0.36,1)",
                }}
              >
                <CardFace
                  card={focusCard.card}
                  isSub={focusCard.isSub}
                  showNumber={focusExpanded && focusShowNumber}
                  onToggleShowNumber={() => setFocusShowNumber((v) => !v)}
                  className="w-full h-full !p-[22px]"
                />
              </div>
            </div>
          );
        })()}
    </>
  );
}
