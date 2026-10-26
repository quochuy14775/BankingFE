import { useState } from "react";
import { Smartphone, Check, ShieldCheck, PartyPopper, RotateCcw } from "lucide-react";
import { mockAccounts, formatVND } from "../lib/mockData.ts";
import OtpInput from "../components/OtpInput.tsx";

type Step = "form" | "otp" | "success";

const MOCK_OTP = "123456";

const CARRIERS = [
  { id: "viettel", name: "Viettel", color: "#00a651" },
  { id: "mobifone", name: "MobiFone", color: "#e4032e" },
  { id: "vinaphone", name: "Vinaphone", color: "#0072bc" },
  { id: "vietnamobile", name: "Vietnamobile", color: "#f7941d" },
];

const PACKAGES = [10000, 20000, 50000, 100000, 200000, 500000];

export default function TopUp() {
  const [step, setStep] = useState<Step>("form");
  const [carrierId, setCarrierId] = useState(CARRIERS[0].id);
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState<number | null>(null);
  const [fromAccountId, setFromAccountId] = useState(mockAccounts[0].id);
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [formError, setFormError] = useState("");

  const carrier = CARRIERS.find((c) => c.id === carrierId)!;

  function reset() {
    setStep("form");
    setPhone("");
    setAmount(null);
    setOtp("");
    setOtpError("");
    setFormError("");
  }

  function handleSubmit() {
    if (!/^0\d{9}$/.test(phone)) {
      setFormError("Số điện thoại không hợp lệ.");
      return;
    }
    if (!amount) {
      setFormError("Vui lòng chọn mệnh giá nạp.");
      return;
    }
    setFormError("");
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
    setStep("success");
  }

  return (
    <div className="max-w-xl mx-auto">
      <div className="mb-[18px] text-center">
        <h1 className="text-[22px] font-semibold text-slate-900 tracking-tight mb-[3px]">Nạp tiền điện thoại</h1>
        <p className="text-slate-500 text-[13px]">Nạp thẻ cào trực tiếp cho mọi nhà mạng.</p>
      </div>

      <div className="bg-white rounded-3xl border border-black/5 p-[15px] shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
        {step === "form" && (
          <div className="space-y-[15px] animate-step-in">
            <div>
              <label className="block text-[11px] font-medium text-slate-500 mb-[8px]">Nhà mạng</label>
              <div className="grid grid-cols-4 gap-[8px]">
                {CARRIERS.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setCarrierId(c.id)}
                    className={`flex flex-col items-center gap-[6px] py-[10px] rounded-2xl border-2 transition-all ${
                      carrierId === c.id ? "border-slate-900 bg-slate-50" : "border-transparent bg-slate-100 hover:bg-slate-200/70"
                    }`}
                  >
                    <span
                      className="w-[26px] h-[26px] rounded-full flex items-center justify-center text-white text-[10px] font-bold"
                      style={{ background: c.color }}
                    >
                      {c.name[0]}
                    </span>
                    <span className="text-[9px] font-medium text-slate-600">{c.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-500 mb-[6px]">Số điện thoại</label>
              <div className="relative">
                <Smartphone size={13} className="absolute left-[12px] top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  placeholder="09xxxxxxxx"
                  className="w-full pl-[34px] pr-[12px] py-[9px] rounded-2xl bg-slate-100 border-0 text-[12px] font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-500 mb-[8px]">Mệnh giá nạp</label>
              <div className="grid grid-cols-3 gap-[8px]">
                {PACKAGES.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setAmount(p)}
                    className={`py-[10px] rounded-2xl text-[12px] font-semibold transition-all ${
                      amount === p ? "text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200/70"
                    }`}
                    style={amount === p ? { background: "linear-gradient(135deg, #818cf8, #c026d3)" } : undefined}
                  >
                    {formatVND(p)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-500 mb-[6px]">Tài khoản thanh toán</label>
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

            {formError && <p className="text-[11px] text-red-500 font-medium">{formError}</p>}

            <button
              onClick={handleSubmit}
              className="w-full py-[11px] rounded-2xl text-[12px] font-medium text-white transition-transform hover:scale-[1.02]"
              style={{ background: "linear-gradient(135deg, #818cf8, #c026d3)" }}
            >
              Tiếp tục
            </button>
          </div>
        )}

        {step === "otp" && (
          <div className="text-center space-y-[15px] animate-step-in">
            <div className="mx-auto w-[46px] h-[46px] rounded-full bg-slate-100 flex items-center justify-center">
              <ShieldCheck size={20} className="text-slate-700" />
            </div>
            <div>
              <h2 className="text-[14px] font-semibold text-slate-900 tracking-tight">Xác thực nạp tiền</h2>
              <p className="text-[11px] text-slate-500 mt-[3px]">
                Nạp <span className="font-medium text-slate-900">{formatVND(amount ?? 0)}</span> cho số{" "}
                <span className="font-medium text-slate-900">{phone}</span> ({carrier.name})
              </p>
            </div>
            <OtpInput value={otp} onChange={setOtp} error={!!otpError} />
            {otpError && <p className="text-[11px] text-red-500 font-medium">{otpError}</p>}
            <p className="text-[10px] text-slate-400">Mã demo: {MOCK_OTP}</p>
            <div className="flex gap-[9px] max-w-[280px] mx-auto">
              <button
                onClick={() => setStep("form")}
                className="flex-1 py-[10px] rounded-2xl text-[12px] font-medium bg-slate-100 text-slate-700 hover:bg-slate-200/70 transition-colors"
              >
                Quay lại
              </button>
              <button
                onClick={handleVerifyOtp}
                className="flex-1 py-[10px] rounded-2xl text-[12px] font-medium text-white transition-transform hover:scale-[1.02]"
                style={{ background: "linear-gradient(135deg, #818cf8, #c026d3)" }}
              >
                Xác nhận
              </button>
            </div>
          </div>
        )}

        {step === "success" && (
          <div className="text-center space-y-[12px] py-[10px] animate-step-in">
            <div className="mx-auto w-[54px] h-[54px] rounded-full bg-emerald-50 flex items-center justify-center">
              <PartyPopper size={24} className="text-emerald-600" />
            </div>
            <div>
              <h2 className="text-[15px] font-semibold text-slate-900 tracking-tight">Nạp tiền thành công</h2>
              <p className="text-[11px] text-slate-500 mt-[3px] flex items-center justify-center gap-[4px]">
                <Check size={12} className="text-emerald-600" />
                {formatVND(amount ?? 0)} đã được nạp cho {phone}
              </p>
            </div>
            <button
              onClick={reset}
              className="mx-auto flex items-center gap-[6px] px-[16px] py-[9px] rounded-2xl text-[12px] font-medium bg-slate-900 hover:bg-slate-800 text-white transition-colors"
            >
              <RotateCcw size={13} />
              Nạp tiền khác
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
