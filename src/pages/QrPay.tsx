import { useEffect, useRef, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  QrCode,
  ScanLine,
  Camera,
  Check,
  Store,
  RotateCcw,
  Copy,
  Download,
  ShieldCheck,
  PartyPopper,
} from "lucide-react";
import { mockAccounts, mockUser, formatVND } from "../lib/mockData.ts";
import OtpInput from "../components/OtpInput.tsx";

type Mode = "scan" | "receive";
type ScanStep = "camera" | "amount" | "otp" | "success";

const MOCK_OTP = "123456";

const MOCK_MERCHANTS = [
  { name: "The Coffee House - Nguyễn Huệ", category: "Đồ uống" },
  { name: "Circle K - Lê Lợi", category: "Cửa hàng tiện lợi" },
  { name: "Highlands Coffee - Bến Thành", category: "Đồ uống" },
];

export default function QrPay() {
  const [mode, setMode] = useState<Mode>("scan");

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-[18px] text-center">
        <h1 className="text-[22px] font-semibold text-slate-900 tracking-tight mb-[3px]">QR Pay</h1>
        <p className="text-slate-500 text-[13px]">Quét mã để thanh toán hoặc tạo mã QR để nhận tiền.</p>
      </div>

      <div className="relative flex gap-[4px] mb-[15px] bg-slate-100 p-[3px] rounded-2xl max-w-[320px] mx-auto">
        <div
          className="absolute top-[3px] bottom-[3px] left-[3px] w-[calc(50%-6px)] rounded-xl bg-white shadow-sm transition-transform duration-300 ease-out"
          style={{ transform: mode === "receive" ? "translateX(calc(100% + 6px))" : "translateX(0)" }}
        />
        <button
          type="button"
          onClick={() => setMode("scan")}
          className={`relative z-10 flex-1 flex items-center justify-center gap-[6px] py-[8px] rounded-xl text-[12px] font-medium transition-colors duration-300 ${
            mode === "scan" ? "text-slate-900" : "text-slate-500 hover:text-slate-700"
          }`}
        >
          <ScanLine size={13} />
          Quét mã trả tiền
        </button>
        <button
          type="button"
          onClick={() => setMode("receive")}
          className={`relative z-10 flex-1 flex items-center justify-center gap-[6px] py-[8px] rounded-xl text-[12px] font-medium transition-colors duration-300 ${
            mode === "receive" ? "text-slate-900" : "text-slate-500 hover:text-slate-700"
          }`}
        >
          <QrCode size={13} />
          Mã QR của tôi
        </button>
      </div>

      <div key={mode} className="animate-step-in">
        {mode === "scan" ? <ScanToPay /> : <ReceiveQr />}
      </div>
    </div>
  );
}

function ScanToPay() {
  const [step, setStep] = useState<ScanStep>("camera");
  const [merchant, setMerchant] = useState<{ name: string; category: string } | null>(null);
  const [amount, setAmount] = useState("");
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState(false);
  const [scanning, setScanning] = useState(false);

  function stopCamera() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCameraReady(false);
  }

  useEffect(() => {
    if (step !== "camera" || !scanning) return;
    let cancelled = false;
    setCameraError(false);
    navigator.mediaDevices
      ?.getUserMedia({ video: { facingMode: "environment" } })
      .then((stream) => {
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
        setCameraReady(true);
      })
      .catch(() => setCameraError(true));
    return () => {
      cancelled = true;
      stopCamera();
    };
  }, [step, scanning]);

  useEffect(() => {
    if (!scanning || (!cameraReady && !cameraError)) return;
    const timer = setTimeout(() => {
      const picked = MOCK_MERCHANTS[Math.floor(Math.random() * MOCK_MERCHANTS.length)];
      setMerchant(picked);
      stopCamera();
      setScanning(false);
      setStep("amount");
    }, 2200);
    return () => clearTimeout(timer);
  }, [scanning, cameraReady, cameraError]);

  function reset() {
    setStep("camera");
    setMerchant(null);
    setAmount("");
    setOtp("");
    setOtpError("");
    setScanning(false);
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

  const amountNumber = Number(amount) || 0;

  return (
    <div className="bg-white rounded-3xl border border-black/5 p-[15px] shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      {step === "camera" && (
        <div className="text-center space-y-[12px]">
          <div className="relative mx-auto w-full max-w-[280px] aspect-square rounded-3xl overflow-hidden bg-slate-900 flex items-center justify-center">
            {!scanning ? (
              <div className="flex flex-col items-center gap-[8px] text-white/60">
                <QrCode size={36} />
                <p className="text-[11px] px-[20px]">Nhấn nút bên dưới để mở camera và quét mã QR thanh toán</p>
              </div>
            ) : cameraError ? (
              <div className="flex flex-col items-center gap-[6px] text-white/60 px-[16px]">
                <Camera size={24} />
                <p className="text-[10px] text-center">Không mở được camera. Đang giả lập quét mã...</p>
              </div>
            ) : (
              <>
                <video ref={videoRef} autoPlay muted playsInline className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-[24px] rounded-2xl ring-2 ring-fuchsia-400/70 overflow-hidden">
                  <div className="absolute left-0 right-0 h-[2px] bg-fuchsia-400 shadow-[0_0_8px_rgba(192,38,211,0.8)] animate-face-scan" />
                </div>
                {!cameraReady && <p className="absolute bottom-[12px] text-[9px] text-white/60">Đang mở camera...</p>}
              </>
            )}
          </div>

          <button
            type="button"
            onClick={() => setScanning(true)}
            disabled={scanning}
            className="mx-auto flex items-center gap-[6px] px-[16px] py-[9px] rounded-2xl text-[12px] font-medium text-white transition-transform enabled:hover:scale-[1.02] disabled:opacity-60"
            style={{ background: "linear-gradient(135deg, #818cf8, #c026d3)" }}
          >
            <ScanLine size={14} />
            {scanning ? "Đang quét mã..." : "Bắt đầu quét mã QR"}
          </button>
        </div>
      )}

      {step === "amount" && merchant && (
        <div className="space-y-[15px] animate-step-in">
          <div className="flex items-center gap-[10px] p-[12px] rounded-2xl bg-slate-50">
            <span className="w-[36px] h-[36px] rounded-full bg-slate-900 text-white flex items-center justify-center shrink-0">
              <Store size={16} />
            </span>
            <div className="min-w-0">
              <p className="text-[12px] font-semibold text-slate-900 truncate">{merchant.name}</p>
              <p className="text-[10px] text-slate-400">{merchant.category}</p>
            </div>
            <span className="ml-auto flex items-center gap-[3px] text-[10px] font-medium text-emerald-600 shrink-0">
              <Check size={11} />
              Đã xác thực
            </span>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-500 mb-[6px]">Số tiền thanh toán</label>
            <div className="relative">
              <input
                type="text"
                inputMode="numeric"
                value={amount ? Number(amount).toLocaleString("vi-VN") : ""}
                onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))}
                placeholder="0"
                autoFocus
                className="w-full px-[12px] py-[12px] pr-[40px] rounded-2xl bg-slate-100 border-0 text-[18px] font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
              />
              <span className="absolute right-[14px] top-1/2 -translate-y-1/2 text-[12px] font-medium text-slate-400">đ</span>
            </div>
          </div>

          <div className="flex gap-[9px]">
            <button
              onClick={reset}
              className="flex-1 py-[10px] rounded-2xl text-[12px] font-medium bg-slate-100 text-slate-700 hover:bg-slate-200/70 transition-colors"
            >
              Hủy
            </button>
            <button
              disabled={amountNumber <= 0}
              onClick={() => setStep("otp")}
              className="flex-1 py-[10px] rounded-2xl text-[12px] font-medium text-white transition-transform enabled:hover:scale-[1.02] disabled:opacity-40"
              style={{ background: "linear-gradient(135deg, #818cf8, #c026d3)" }}
            >
              Xác nhận thanh toán
            </button>
          </div>
        </div>
      )}

      {step === "otp" && merchant && (
        <div className="text-center space-y-[15px] animate-step-in">
          <div className="mx-auto w-[46px] h-[46px] rounded-full bg-slate-100 flex items-center justify-center">
            <ShieldCheck size={20} className="text-slate-700" />
          </div>
          <div>
            <h2 className="text-[14px] font-semibold text-slate-900 tracking-tight">Xác thực thanh toán</h2>
            <p className="text-[11px] text-slate-500 mt-[3px]">
              Nhập mã OTP để thanh toán <span className="font-medium text-slate-900">{formatVND(amountNumber)}</span> cho{" "}
              {merchant.name}
            </p>
          </div>
          <OtpInput value={otp} onChange={setOtp} error={!!otpError} />
          {otpError && <p className="text-[11px] text-red-500 font-medium">{otpError}</p>}
          <p className="text-[10px] text-slate-400">Mã demo: {MOCK_OTP}</p>
          <div className="flex gap-[9px] max-w-[280px] mx-auto">
            <button
              onClick={() => setStep("amount")}
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

      {step === "success" && merchant && (
        <div className="text-center space-y-[12px] py-[10px] animate-step-in">
          <div className="mx-auto w-[54px] h-[54px] rounded-full bg-emerald-50 flex items-center justify-center">
            <PartyPopper size={24} className="text-emerald-600" />
          </div>
          <div>
            <h2 className="text-[15px] font-semibold text-slate-900 tracking-tight">Thanh toán thành công</h2>
            <p className="text-[11px] text-slate-500 mt-[3px]">
              Bạn đã thanh toán <span className="font-semibold text-slate-900">{formatVND(amountNumber)}</span> cho{" "}
              {merchant.name}
            </p>
          </div>
          <button
            onClick={reset}
            className="mx-auto flex items-center gap-[6px] px-[16px] py-[9px] rounded-2xl text-[12px] font-medium bg-slate-900 hover:bg-slate-800 text-white transition-colors"
          >
            <RotateCcw size={13} />
            Quét mã khác
          </button>
        </div>
      )}
    </div>
  );
}

function ReceiveQr() {
  const [amount, setAmount] = useState("");
  const [copied, setCopied] = useState(false);
  const account = mockAccounts[0];

  const qrValue = JSON.stringify({
    bank: "VietBank",
    account: account.number.replace(/\s/g, ""),
    name: mockUser.fullName,
    amount: Number(amount) || undefined,
  });

  function handleCopy() {
    navigator.clipboard?.writeText(account.number.replace(/\s/g, ""));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="bg-white rounded-3xl border border-black/5 p-[15px] shadow-[0_1px_2px_rgba(0,0,0,0.04)] text-center space-y-[15px]">
      <div className="mx-auto w-fit p-[12px] rounded-3xl bg-white border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.06)]">
        <QRCodeSVG value={qrValue} size={200} level="M" fgColor="#0f172a" />
      </div>

      <div>
        <p className="text-[13px] font-semibold text-slate-900">{mockUser.fullName}</p>
        <div className="flex items-center justify-center gap-[6px] mt-[3px]">
          <p className="text-[12px] font-medium text-slate-500 font-card-mono">{account.number}</p>
          <button onClick={handleCopy} className="text-slate-400 hover:text-slate-700 transition-colors" title="Sao chép số tài khoản">
            {copied ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
          </button>
        </div>
        <p className="text-[10px] text-slate-400 mt-[2px]">{account.label} — VietBank</p>
      </div>

      <div className="max-w-[240px] mx-auto text-left">
        <label className="block text-[11px] font-medium text-slate-500 mb-[6px]">Số tiền cần nhận (tùy chọn)</label>
        <div className="relative">
          <input
            type="text"
            inputMode="numeric"
            value={amount ? Number(amount).toLocaleString("vi-VN") : ""}
            onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))}
            placeholder="Để trống nếu không cố định"
            className="w-full px-[12px] py-[9px] pr-[30px] rounded-2xl bg-slate-100 border-0 text-[12px] font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
          />
          <span className="absolute right-[12px] top-1/2 -translate-y-1/2 text-[11px] font-medium text-slate-400">đ</span>
        </div>
      </div>

      <button className="mx-auto flex items-center gap-[6px] px-[16px] py-[9px] rounded-2xl text-[12px] font-medium bg-slate-100 hover:bg-slate-200/70 text-slate-700 transition-colors">
        <Download size={13} />
        Lưu mã QR
      </button>
    </div>
  );
}
