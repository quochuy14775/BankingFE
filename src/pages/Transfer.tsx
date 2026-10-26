import { useEffect, useState, type FormEvent } from "react";
import { useLocation } from "react-router-dom";
import { ArrowLeftRight, CheckCircle2, Check, ShieldCheck, Lock, Clock, Zap, Tag } from "lucide-react";
import { mockAccounts, mockContacts, formatVND, resolveAccountName, type Contact } from "../lib/mockData.ts";
import { useBudget } from "../lib/budgetStore.tsx";
import { categoryColor, categoryIcon } from "../lib/categoryVisuals.ts";
import OtpInput from "../components/OtpInput.tsx";
import TransferTimeline from "../components/TransferTimeline.tsx";
import TransferRouteVisual from "../components/TransferRouteVisual.tsx";
import FloatingBadges from "../components/FloatingBadges.tsx";

type Step = "form" | "confirm" | "otp" | "success";

const MOCK_OTP = "123456";
const RESEND_SECONDS = 60;

interface TransferNavState {
  contact?: Contact;
  amount?: number;
  note?: string;
}

export default function Transfer() {
  const location = useLocation();
  const navState = (location.state as TransferNavState | null) ?? null;
  const { categories, addTransaction } = useBudget();

  const [step, setStep] = useState<Step>("form");
  const [fromAccountId, setFromAccountId] = useState(mockAccounts[0].id);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(navState?.contact ?? null);
  const [contactLocked, setContactLocked] = useState(!!navState?.contact);
  const [entryMode, setEntryMode] = useState<"list" | "manual">("list");
  const [manualBank, setManualBank] = useState("");
  const [manualNumber, setManualNumber] = useState("");
  const [amount, setAmount] = useState(navState?.amount ? String(navState.amount) : "");
  const [note, setNote] = useState(navState?.note ?? "");
  const [categoryId, setCategoryId] = useState<string | undefined>(undefined);
  const [error, setError] = useState("");

  const resolvedName = resolveAccountName(manualNumber);
  const manualContact: Contact | null =
    manualBank.trim() && resolvedName
      ? { id: "manual-entry", name: resolvedName, bank: manualBank.trim(), number: manualNumber.trim() }
      : null;

  const activeContact = entryMode === "manual" ? manualContact : selectedContact;

  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [resendIn, setResendIn] = useState(RESEND_SECONDS);

  const fromAccount = mockAccounts.find((a) => a.id === fromAccountId)!;
  const amountNumber = Number(amount.replace(/\D/g, "")) || 0;

  useEffect(() => {
    if (step !== "otp" || resendIn <= 0) return;
    const timer = setInterval(() => setResendIn((s) => s - 1), 1000);
    return () => clearInterval(timer);
  }, [step, resendIn]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!activeContact) {
      setError(entryMode === "manual" ? "Vui lòng nhập đầy đủ thông tin người nhận." : "Vui lòng chọn người nhận.");
      return;
    }
    if (entryMode === "manual") setSelectedContact(activeContact);
    if (amountNumber <= 0) {
      setError("Vui lòng nhập số tiền hợp lệ.");
      return;
    }
    if (amountNumber > fromAccount.balance) {
      setError("Số dư không đủ để thực hiện giao dịch.");
      return;
    }
    setError("");
    setStep("confirm");
  }

  function handleConfirm() {
    setOtp("");
    setOtpError("");
    setResendIn(RESEND_SECONDS);
    setStep("otp");
  }

  function handleVerifyOtp() {
    if (otp.length < 6) {
      setOtpError("Vui lòng nhập đủ 6 số.");
      return;
    }
    if (otp !== MOCK_OTP) {
      setOtpError("Mã OTP không đúng. Vui lòng thử lại.");
      return;
    }
    setOtpError("");
    if (selectedContact) {
      addTransaction({
        date: new Date().toISOString().slice(0, 10),
        type: "out",
        desc: `Chuyển khoản - ${selectedContact.name}`,
        amount: amountNumber,
        categoryId,
      });
    }
    setStep("success");
  }

  function handleResendOtp() {
    if (resendIn > 0) return;
    setOtp("");
    setOtpError("");
    setResendIn(RESEND_SECONDS);
  }

  function resetForm() {
    setSelectedContact(null);
    setAmount("");
    setNote("");
    setCategoryId(undefined);
    setOtp("");
    setOtpError("");
    setStep("form");
  }

  return (
    <div className="relative min-h-[675px]">
      {/* ambient page background */}
      <div className="pointer-events-none fixed top-[72px] left-1/4 w-[288px] h-[288px] rounded-full bg-indigo-200/20 blur-3xl -z-10 animate-ambient-pulse" />
      <div
        className="pointer-events-none fixed bottom-[30px] right-1/4 w-[288px] h-[288px] rounded-full bg-sky-200/20 blur-3xl -z-10 animate-ambient-pulse"
        style={{ animationDelay: "3s" }}
      />

      <FloatingBadges />

      <div className="max-w-3xl mx-auto text-center">
        <h1 className="text-[22px] font-semibold text-slate-900 tracking-tight mb-[3px]">Chuyển khoản</h1>
        <p className="text-slate-500 mb-[18px] text-[13px]">Chuyển tiền nhanh chóng và an toàn.</p>
      </div>

      <div className="max-w-3xl mx-auto mb-[15px]">
        <TransferRouteVisual
          fromLabel={fromAccount.label}
          toContact={step === "form" ? activeContact : selectedContact}
          amount={amountNumber}
          isComplete={step === "success"}
        />
      </div>

      <div className="max-w-3xl mx-auto bg-white rounded-3xl border border-black/5 p-[15px] mb-[15px] shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
        <TransferTimeline current={step} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-[12px] max-w-3xl mx-auto">
        <div className="lg:col-span-2 bg-white rounded-3xl border border-black/5 p-[15px] shadow-[0_1px_2px_rgba(0,0,0,0.04)] overflow-hidden">
        <div key={step} className="animate-step-in">
        {step === "form" && (
          <form onSubmit={handleSubmit} className="space-y-[15px]">
            <div>
              <label className="block text-[11px] font-medium text-slate-500 mb-[6px]">Tài khoản nguồn</label>
              <select
                value={fromAccountId}
                onChange={(e) => setFromAccountId(e.target.value)}
                className="w-full px-[12px] py-[9px] rounded-2xl bg-slate-100 border-0 text-[12px] font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 appearance-none"
              >
                {mockAccounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.label} — {formatVND(acc.balance)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-500 mb-[6px]">Người nhận</label>
              {contactLocked && selectedContact ? (
                <div
                  className="w-full flex items-center justify-between px-[12px] py-[9px] rounded-2xl text-white text-[12px]"
                  style={{ background: "linear-gradient(135deg, #818cf8, #c026d3)" }}
                >
                  <span>
                    <span className="font-medium">{selectedContact.name}</span>
                    <span className="text-white/70"> · {selectedContact.bank}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setContactLocked(false);
                      setSelectedContact(null);
                    }}
                    className="text-[10px] font-medium text-white/70 hover:text-white underline underline-offset-2"
                  >
                    Đổi người nhận
                  </button>
                </div>
              ) : (
                <div>
                  <div className="relative flex gap-[4px] mb-[9px] bg-slate-100 p-[3px] rounded-2xl">
                    <div
                      className="absolute top-[3px] bottom-[3px] left-[3px] w-[calc(50%-6px)] rounded-xl bg-white shadow-sm transition-transform duration-300 ease-out"
                      style={{ transform: entryMode === "manual" ? "translateX(calc(100% + 6px))" : "translateX(0)" }}
                    />
                    <button
                      type="button"
                      onClick={() => setEntryMode("list")}
                      className={`relative z-10 flex-1 py-[6px] rounded-xl text-[11px] font-medium transition-colors duration-300 ${
                        entryMode === "list" ? "text-slate-900" : "text-slate-500 hover:text-slate-700"
                      }`}
                    >
                      Đã lưu / gần đây
                    </button>
                    <button
                      type="button"
                      onClick={() => setEntryMode("manual")}
                      className={`relative z-10 flex-1 py-[6px] rounded-xl text-[11px] font-medium transition-colors duration-300 ${
                        entryMode === "manual" ? "text-slate-900" : "text-slate-500 hover:text-slate-700"
                      }`}
                    >
                      Nhập thủ công
                    </button>
                  </div>

                  {entryMode === "list" ? (
                    <div className="space-y-[6px]">
                      {mockContacts.map((c) => (
                        <button
                          type="button"
                          key={c.id}
                          onClick={() => setSelectedContact(c)}
                          className={`w-full flex items-center justify-between px-[12px] py-[9px] rounded-2xl text-left text-[12px] transition-all ${
                            selectedContact?.id === c.id
                              ? "text-white"
                              : "bg-slate-100 text-slate-900 hover:bg-slate-200/70"
                          }`}
                          style={
                            selectedContact?.id === c.id
                              ? { background: "linear-gradient(135deg, #818cf8, #c026d3)" }
                              : undefined
                          }
                        >
                          <span>
                            <span className="font-medium">{c.name}</span>
                            <span className={selectedContact?.id === c.id ? "text-white/70" : "text-slate-400"}> · {c.bank}</span>
                          </span>
                          <span className={`flex items-center gap-[6px] font-card-mono text-[10px] ${selectedContact?.id === c.id ? "text-white/70" : "text-slate-400"}`}>
                            {c.number}
                            {selectedContact?.id === c.id && <Check size={10} />}
                          </span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-[8px]">
                      <input
                        type="text"
                        value={manualBank}
                        onChange={(e) => setManualBank(e.target.value)}
                        placeholder="Tên ngân hàng"
                        className="w-full px-[12px] py-[9px] rounded-2xl bg-slate-100 border-0 text-[12px] font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                      />
                      <input
                        type="text"
                        inputMode="numeric"
                        value={manualNumber}
                        onChange={(e) => setManualNumber(e.target.value.replace(/\D/g, ""))}
                        placeholder="Số tài khoản"
                        className="w-full px-[12px] py-[9px] rounded-2xl bg-slate-100 border-0 text-[12px] font-card-mono font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                      />

                      {manualNumber.replace(/\D/g, "").length >= 6 && (
                        <div
                          className={`flex items-center gap-[6px] px-[12px] py-[9px] rounded-2xl text-[11px] font-medium transition-colors ${
                            resolvedName ? "bg-emerald-50 text-emerald-700" : "bg-slate-50 text-slate-400"
                          }`}
                        >
                          {resolvedName ? (
                            <>
                              <Check size={10} />
                              {resolvedName}
                            </>
                          ) : (
                            "Đang xác thực tên người nhận..."
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-500 mb-[6px]">Số tiền</label>
              <input
                type="text"
                inputMode="numeric"
                value={amount ? Number(amount.replace(/\D/g, "")).toLocaleString("vi-VN") : ""}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                className="w-full px-[12px] py-[9px] rounded-2xl bg-slate-100 border-0 text-[12px] font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-500 mb-[6px]">Lời nhắn (tùy chọn)</label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Nội dung chuyển khoản"
                className="w-full px-[12px] py-[9px] rounded-2xl bg-slate-100 border-0 text-[12px] font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
              />
            </div>

            <div>
              <label className="flex items-center gap-[5px] text-[11px] font-medium text-slate-500 mb-[6px]">
                <Tag size={10} />
                Phân loại chi tiêu (tùy chọn)
              </label>
              <div className="flex flex-wrap gap-[6px]">
                <button
                  type="button"
                  onClick={() => setCategoryId(undefined)}
                  className={`px-[10px] py-[6px] rounded-full text-[11px] font-medium transition-all ${
                    !categoryId
                      ? "bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200/70"
                  }`}
                >
                  Không phân loại
                </button>
                {categories.map((cat) => {
                  const color = categoryColor(cat.color);
                  const Icon = categoryIcon(cat.icon);
                  const active = categoryId === cat.id;
                  return (
                    <button
                      type="button"
                      key={cat.id}
                      onClick={() => setCategoryId(cat.id)}
                      className={`flex items-center gap-[5px] px-[10px] py-[6px] rounded-full text-[11px] font-medium transition-all ${
                        active ? `${color.bg} ${color.text} ring-1 ${color.ring}` : "bg-slate-100 text-slate-600 hover:bg-slate-200/70"
                      }`}
                    >
                      <Icon size={11} />
                      {cat.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {error && <p className="text-[11px] text-red-500 font-medium">{error}</p>}

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-[6px] text-white font-medium py-[10px] rounded-2xl text-[12px] transition-transform hover:scale-[1.02]"
              style={{ background: "linear-gradient(135deg, #818cf8, #c026d3)" }}
            >
              <ArrowLeftRight size={11} />
              Tiếp tục
            </button>
          </form>
        )}

        {step === "confirm" && selectedContact && (
          <div className="space-y-[15px]">
            <h2 className="text-[16px] font-semibold text-slate-900 tracking-tight">Xác nhận giao dịch</h2>
            <dl className="space-y-[10px] text-[12px] bg-slate-50 rounded-2xl p-[15px]">
              <Row label="Từ tài khoản" value={`${fromAccount.label} (${fromAccount.number})`} />
              <Row label="Người nhận" value={`${selectedContact.name} — ${selectedContact.bank}`} />
              <Row label="Số tài khoản" value={selectedContact.number} />
              <Row label="Số tiền" value={formatVND(amountNumber)} highlight />
              {note && <Row label="Lời nhắn" value={note} />}
              <Row
                label="Phân loại"
                value={categoryId ? categories.find((c) => c.id === categoryId)?.name ?? "—" : "Không phân loại"}
              />
            </dl>
            <div className="flex gap-[9px]">
              <button
                onClick={() => setStep("form")}
                className="flex-1 py-[10px] rounded-2xl text-[12px] font-medium bg-slate-100 text-slate-700 hover:bg-slate-200/70 transition-colors"
              >
                Quay lại
              </button>
              <button
                onClick={handleConfirm}
                className="flex-1 py-[10px] rounded-2xl text-[12px] font-medium text-white transition-transform hover:scale-[1.02]"
                style={{ background: "linear-gradient(135deg, #818cf8, #c026d3)" }}
              >
                Xác nhận
              </button>
            </div>
          </div>
        )}

        {step === "otp" && selectedContact && (
          <div className="space-y-[15px]">
            <div className="text-center">
              <div className="mx-auto w-[42px] h-[42px] rounded-full bg-fuchsia-50 flex items-center justify-center mb-[12px]">
                <ShieldCheck className="text-fuchsia-600" size={20} />
              </div>
              <h2 className="text-[16px] font-semibold text-slate-900 tracking-tight">Xác thực OTP</h2>
              <p className="text-[11px] text-slate-500 mt-[4px]">
                Nhập mã 6 số đã gửi tới số điện thoại của bạn để hoàn tất giao dịch{" "}
                {formatVND(amountNumber)}.
              </p>
              <p className="text-[10px] text-slate-400 mt-[3px]">(Demo: mã OTP là 123456)</p>
            </div>

            <OtpInput value={otp} onChange={setOtp} error={!!otpError} />

            {otpError && <p className="text-[11px] text-red-500 font-medium text-center">{otpError}</p>}

            <div className="text-center text-[11px] text-slate-500">
              {resendIn > 0 ? (
                <span>Gửi lại mã sau {resendIn}s</span>
              ) : (
                <button onClick={handleResendOtp} className="font-semibold text-slate-900 hover:underline">
                  Gửi lại mã OTP
                </button>
              )}
            </div>

            <div className="flex gap-[9px]">
              <button
                onClick={() => setStep("confirm")}
                className="flex-1 py-[10px] rounded-2xl text-[12px] font-medium bg-slate-100 text-slate-700 hover:bg-slate-200/70 transition-colors"
              >
                Quay lại
              </button>
              <button
                onClick={handleVerifyOtp}
                className="flex-1 py-[10px] rounded-2xl text-[12px] font-medium text-white transition-transform hover:scale-[1.02]"
                style={{ background: "linear-gradient(135deg, #818cf8, #c026d3)" }}
              >
                Xác thực
              </button>
            </div>
          </div>
        )}

        {step === "success" && selectedContact && (
          <div className="text-center py-[18px] space-y-[12px]">
            <div className="mx-auto w-[48px] h-[48px] rounded-full bg-emerald-50 flex items-center justify-center">
              <CheckCircle2 className="text-emerald-500" size={27} />
            </div>
            <h2 className="text-[16px] font-semibold text-slate-900 tracking-tight">Chuyển khoản thành công</h2>
            <p className="text-[12px] text-slate-500">
              Bạn đã chuyển {formatVND(amountNumber)} đến {selectedContact.name}.
            </p>
            <button
              onClick={resetForm}
              className="mt-[6px] px-[15px] py-[9px] rounded-2xl text-[12px] font-medium bg-slate-900 hover:bg-slate-800 text-white transition-colors"
            >
              Thực hiện giao dịch khác
            </button>
          </div>
        )}
        </div>
        </div>

        {/* Side column — context & reassurance while the user completes the flow */}
        <div className="space-y-[12px]">
          <div className="bg-white rounded-3xl border border-black/5 p-[15px] shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
            <h3 className="text-[11px] font-semibold text-slate-900 mb-[12px]">Bảo mật giao dịch</h3>
            <ul className="space-y-[12px]">
              <li className="flex items-start gap-[9px]">
                <span className="w-[24px] h-[24px] rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                  <Lock size={10} />
                </span>
                <p className="text-[10px] text-slate-500 leading-relaxed">
                  Mọi giao dịch được mã hóa và xác thực bằng OTP trước khi hoàn tất.
                </p>
              </li>
              <li className="flex items-start gap-[9px]">
                <span className="w-[24px] h-[24px] rounded-full bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
                  <Zap size={10} />
                </span>
                <p className="text-[10px] text-slate-500 leading-relaxed">
                  Tiền đến tài khoản người nhận trong vài giây với chuyển khoản 24/7.
                </p>
              </li>
              <li className="flex items-start gap-[9px]">
                <span className="w-[24px] h-[24px] rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                  <Clock size={10} />
                </span>
                <p className="text-[10px] text-slate-500 leading-relaxed">
                  Có thể tra soát lịch sử giao dịch bất kỳ lúc nào trong mục Lịch sử.
                </p>
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-3xl border border-black/5 p-[15px] shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
            <h3 className="text-[11px] font-semibold text-slate-900 mb-[12px]">Hạn mức chuyển khoản</h3>
            <div className="space-y-[9px]">
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-slate-500">Đã dùng hôm nay</span>
                <span className="font-semibold text-slate-900">{formatVND(2500000)} / {formatVND(500000000)}</span>
              </div>
              <div className="h-[6px] rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full"
                  style={{ width: "0.5%", background: "linear-gradient(90deg, #818cf8, #c026d3)" }}
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-black/5 p-[15px] shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
            <h3 className="text-[11px] font-semibold text-slate-900 mb-[12px]">Người nhận gần đây</h3>
            <ul className="space-y-[9px]">
              {mockContacts.map((c) => (
                <li key={c.id} className="flex items-center gap-[9px]">
                  <span className="w-[24px] h-[24px] rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-[10px] font-semibold">
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
    </div>
  );
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex justify-between">
      <dt className="text-slate-500">{label}</dt>
      <dd className={highlight ? "font-semibold text-slate-900" : "text-slate-800 font-medium"}>{value}</dd>
    </div>
  );
}
