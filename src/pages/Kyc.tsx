import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  Check,
  IdCard,
  Camera,
  ShieldCheck,
  PartyPopper,
  Upload,
  RotateCcw,
  ScanLine,
  type LucideIcon,
} from "lucide-react";
import { extractIdChipInfo, type ExtractedIdInfo } from "../lib/mockData.ts";
import OtpInput from "../components/OtpInput.tsx";

type KycStep = "documents" | "info" | "selfie" | "otp" | "success";

const MOCK_OTP = "123456";
const RESEND_SECONDS = 60;

const steps: { key: KycStep; label: string; icon: LucideIcon }[] = [
  { key: "documents", label: "Giấy tờ", icon: Upload },
  { key: "info", label: "Thông tin", icon: IdCard },
  { key: "selfie", label: "Khuôn mặt", icon: Camera },
  { key: "otp", label: "Xác thực OTP", icon: ShieldCheck },
  { key: "success", label: "Hoàn tất", icon: PartyPopper },
];

function DocumentDropzone({
  label,
  preview,
  onChange,
}: {
  label: string;
  preview: string | null;
  onChange: (url: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    onChange(URL.createObjectURL(file));
  }

  return (
    <div>
      <p className="text-[10px] font-medium text-slate-500 mb-[6px]">{label}</p>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className={`relative w-full aspect-video rounded-2xl border-2 border-dashed overflow-hidden flex flex-col items-center justify-center gap-[6px] transition-colors ${
          preview ? "border-transparent" : "border-slate-200 hover:border-slate-300 bg-slate-50"
        }`}
      >
        {preview ? (
          <>
            <img src={preview} alt={label} className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-[6px] text-white text-[11px] font-medium">
              <RotateCcw size={13} />
              Đổi ảnh khác
            </div>
          </>
        ) : (
          <>
            <Upload size={18} className="text-slate-400" />
            <span className="text-[11px] text-slate-400 font-medium">Tải ảnh lên</span>
          </>
        )}
      </button>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
    </div>
  );
}

export default function Kyc() {
  const navigate = useNavigate();
  const [step, setStep] = useState<KycStep>("documents");
  const stepIndex = steps.findIndex((s) => s.key === step);

  const [frontId, setFrontId] = useState<string | null>(null);
  const [backId, setBackId] = useState<string | null>(null);
  const [selfie, setSelfie] = useState<string | null>(null);
  const selfieInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState(false);
  const [capturing, setCapturing] = useState(false);

  function stopCamera() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCameraReady(false);
  }

  useEffect(() => {
    if (step !== "selfie" || selfie) return;
    let cancelled = false;
    setCameraError(false);
    navigator.mediaDevices
      ?.getUserMedia({ video: { facingMode: "user" } })
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
  }, [step, selfie]);

  function handleCapture() {
    const video = videoRef.current;
    if (!video) return;
    setCapturing(true);
    setTimeout(() => {
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx?.translate(canvas.width, 0);
      ctx?.scale(-1, 1);
      ctx?.drawImage(video, 0, 0);
      setSelfie(canvas.toDataURL("image/jpeg"));
      stopCamera();
      setCapturing(false);
    }, 900);
  }

  function handleRetake() {
    setSelfie(null);
  }

  const [extracting, setExtracting] = useState(false);
  const [extracted, setExtracted] = useState<ExtractedIdInfo | null>(null);

  function handleFrontIdChange(url: string) {
    setFrontId(url);
    setExtracted(null);
    setExtracting(true);
    setTimeout(() => {
      setExtracted(extractIdChipInfo());
      setExtracting(false);
    }, 1200);
  }

  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [resendIn, setResendIn] = useState(RESEND_SECONDS);

  useEffect(() => {
    if (step !== "otp" || resendIn <= 0) return;
    const timer = setInterval(() => setResendIn((s) => s - 1), 1000);
    return () => clearInterval(timer);
  }, [step, resendIn]);

  function handleSelfieFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelfie(URL.createObjectURL(file));
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

  function handleResendOtp() {
    if (resendIn > 0) return;
    setOtp("");
    setOtpError("");
    setResendIn(RESEND_SECONDS);
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-[18px] text-center">
        <h1 className="text-[21px] font-semibold text-slate-900 tracking-tight mb-[3px]">Xác thực danh tính (KYC)</h1>
        <p className="text-slate-500 text-[12px]">Hoàn tất các bước sau để xác thực tài khoản của bạn.</p>
      </div>

      <div className="bg-white rounded-3xl border border-black/5 p-[15px] mb-[15px] shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
        <div className="flex items-center">
          {steps.map((s, i) => {
            const isDone = i < stepIndex;
            const isActive = i === stepIndex;
            const Icon = s.icon;
            return (
              <div key={s.key} className={`flex items-center ${i < steps.length - 1 ? "flex-1" : ""}`}>
                <div className="flex flex-col items-center">
                  <div
                    className={`w-[30px] h-[30px] rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                      isDone
                        ? "text-white border-transparent shadow-[0_4px_14px_-4px_rgba(192,38,211,0.5)]"
                        : isActive
                          ? "bg-white border-fuchsia-500 text-fuchsia-600 shadow-[0_0_0_3px_rgba(192,38,211,0.1)]"
                          : "bg-white border-slate-200 text-slate-300"
                    }`}
                    style={isDone ? { background: "linear-gradient(135deg, #818cf8, #c026d3)" } : undefined}
                  >
                    {isDone ? <Check size={12} /> : <Icon size={12} />}
                  </div>
                  <span
                    className={`mt-[6px] text-[8px] font-medium whitespace-nowrap transition-colors duration-300 ${
                      isActive ? "text-fuchsia-600" : isDone ? "text-slate-600" : "text-slate-300"
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div className="flex-1 h-[2px] mx-[6px] -mt-[15px] rounded-full bg-slate-200 overflow-hidden">
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
      </div>

      <div className="bg-white rounded-3xl border border-black/5 p-[15px] shadow-[0_1px_2px_rgba(0,0,0,0.04)] overflow-hidden">
        <div key={step} className="animate-step-in">
          {step === "documents" && (
            <div className="space-y-[12px]">
              <h2 className="text-[14px] font-semibold text-slate-900 tracking-tight">Tải lên giấy tờ tùy thân</h2>
              <p className="text-[11px] text-slate-500">
                Chụp rõ CCCD gắn chip hai mặt — hệ thống sẽ tự động đọc dữ liệu từ chip để điền thông tin.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-[12px]">
                <div>
                  <DocumentDropzone label="Mặt trước (có chip)" preview={frontId} onChange={handleFrontIdChange} />
                  {extracting && (
                    <p className="flex items-center gap-[4px] text-[10px] text-fuchsia-600 font-medium mt-[6px]">
                      <ScanLine size={12} className="animate-pulse" />
                      Đang đọc dữ liệu từ chip CCCD...
                    </p>
                  )}
                  {extracted && !extracting && (
                    <p className="flex items-center gap-[4px] text-[10px] text-emerald-600 font-medium mt-[6px]">
                      <Check size={12} />
                      Đã đọc dữ liệu từ chip
                    </p>
                  )}
                </div>
                <DocumentDropzone label="Mặt sau" preview={backId} onChange={setBackId} />
              </div>
              <div className="flex gap-[9px] pt-[3px]">
                <button
                  disabled={!frontId || !backId || !extracted}
                  onClick={() => setStep("info")}
                  className="flex-1 py-[10px] rounded-2xl text-[12px] font-medium text-white transition-transform enabled:hover:scale-[1.02] disabled:opacity-40"
                  style={{ background: "linear-gradient(135deg, #818cf8, #c026d3)" }}
                >
                  Tiếp tục
                </button>
              </div>
            </div>
          )}

          {step === "info" && extracted && (
            <div className="space-y-[12px]">
              <h2 className="text-[14px] font-semibold text-slate-900 tracking-tight">Xác nhận thông tin từ CCCD</h2>
              <p className="flex items-center gap-[4px] text-[11px] text-emerald-600 font-medium">
                <ScanLine size={12} />
                Tự động điền từ dữ liệu chip — vui lòng kiểm tra lại
              </p>
              <dl className="space-y-[9px] text-[12px] bg-slate-50 rounded-2xl p-[12px]">
                <div className="flex justify-between">
                  <dt className="text-slate-500">Họ và tên</dt>
                  <dd className="font-medium text-slate-900">{extracted.fullName}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Số CCCD</dt>
                  <dd className="font-medium text-slate-900 font-card-mono">{extracted.idNumber}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Ngày sinh</dt>
                  <dd className="font-medium text-slate-900">{extracted.dob}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Giới tính</dt>
                  <dd className="font-medium text-slate-900">{extracted.gender}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Địa chỉ</dt>
                  <dd className="font-medium text-slate-900 text-right">{extracted.address}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Ngày cấp — Hết hạn</dt>
                  <dd className="font-medium text-slate-900">
                    {extracted.issueDate} — {extracted.expiryDate}
                  </dd>
                </div>
              </dl>
              <div className="flex gap-[9px]">
                <button
                  onClick={() => setStep("documents")}
                  className="flex-1 py-[10px] rounded-2xl text-[12px] font-medium bg-slate-100 text-slate-700 hover:bg-slate-200/70 transition-colors"
                >
                  Quay lại
                </button>
                <button
                  onClick={() => setStep("selfie")}
                  className="flex-1 py-[10px] rounded-2xl text-[12px] font-medium text-white transition-transform hover:scale-[1.02]"
                  style={{ background: "linear-gradient(135deg, #818cf8, #c026d3)" }}
                >
                  Thông tin chính xác, tiếp tục
                </button>
              </div>
            </div>
          )}

          {step === "selfie" && (
            <div className="space-y-[12px] text-center">
              <h2 className="text-[14px] font-semibold text-slate-900 tracking-tight">Xác thực khuôn mặt</h2>
              <p className="text-[11px] text-slate-500">
                {selfie
                  ? "Ảnh chân dung đã được ghi nhận."
                  : "Đưa khuôn mặt vào khung hình, đủ sáng, không đeo khẩu trang."}
              </p>

              <div className="relative mx-auto w-[135px] h-[135px] rounded-full overflow-hidden bg-slate-900 flex items-center justify-center">
                {selfie ? (
                  <img src={selfie} alt="Ảnh chân dung" className="absolute inset-0 w-full h-full object-cover" />
                ) : cameraError ? (
                  <button
                    type="button"
                    onClick={() => selfieInputRef.current?.click()}
                    className="absolute inset-0 flex flex-col items-center justify-center gap-[6px] bg-slate-50 hover:bg-slate-100 transition-colors"
                  >
                    <Camera size={20} className="text-slate-400" />
                    <span className="text-[9px] text-slate-400 font-medium px-[9px]">Không mở được camera, tải ảnh lên</span>
                  </button>
                ) : (
                  <>
                    <video
                      ref={videoRef}
                      autoPlay
                      muted
                      playsInline
                      className="absolute inset-0 w-full h-full object-cover -scale-x-100"
                    />
                    {cameraReady && (
                      <div className="absolute inset-0 rounded-full ring-2 ring-fuchsia-400/70 pointer-events-none overflow-hidden">
                        <div className="absolute left-0 right-0 h-[2px] bg-fuchsia-400 shadow-[0_0_8px_rgba(192,38,211,0.8)] animate-face-scan" />
                      </div>
                    )}
                    {!cameraReady && (
                      <span className="text-[9px] text-white/60 font-medium">Đang mở camera...</span>
                    )}
                  </>
                )}
                {capturing && (
                  <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                    <ScanLine size={22} className="text-fuchsia-600 animate-pulse" />
                  </div>
                )}
              </div>
              <input ref={selfieInputRef} type="file" accept="image/*" capture="user" className="hidden" onChange={handleSelfieFile} />

              {!selfie && !cameraError && (
                <button
                  type="button"
                  disabled={!cameraReady || capturing}
                  onClick={handleCapture}
                  className="mx-auto flex items-center gap-[6px] px-[15px] py-[9px] rounded-2xl text-[12px] font-medium text-white transition-transform enabled:hover:scale-[1.02] disabled:opacity-40"
                  style={{ background: "linear-gradient(135deg, #818cf8, #c026d3)" }}
                >
                  <Camera size={14} />
                  {capturing ? "Đang quét..." : "Quét khuôn mặt"}
                </button>
              )}

              {selfie && (
                <button
                  type="button"
                  onClick={handleRetake}
                  className="mx-auto flex items-center gap-[6px] text-[11px] font-medium text-slate-500 hover:text-slate-900"
                >
                  <RotateCcw size={12} />
                  Quét lại
                </button>
              )}

              <div className="flex gap-[9px] pt-[3px] max-w-[300px] mx-auto">
                <button
                  onClick={() => setStep("documents")}
                  className="flex-1 py-[10px] rounded-2xl text-[12px] font-medium bg-slate-100 text-slate-700 hover:bg-slate-200/70 transition-colors"
                >
                  Quay lại
                </button>
                <button
                  disabled={!selfie}
                  onClick={() => setStep("otp")}
                  className="flex-1 py-[10px] rounded-2xl text-[12px] font-medium text-white transition-transform enabled:hover:scale-[1.02] disabled:opacity-40"
                  style={{ background: "linear-gradient(135deg, #818cf8, #c026d3)" }}
                >
                  Tiếp tục
                </button>
              </div>
            </div>
          )}

          {step === "otp" && (
            <div className="space-y-[12px]">
              <div className="text-center">
                <div className="mx-auto w-[30px] h-[30px] rounded-full bg-fuchsia-50 flex items-center justify-center mb-[9px]" style={{ width: 42, height: 42 }}>
                  <ShieldCheck className="text-fuchsia-600" size={20} />
                </div>
                <h2 className="text-[14px] font-semibold text-slate-900 tracking-tight">Xác thực OTP</h2>
                <p className="text-[11px] text-slate-500 mt-[3px]">
                  Nhập mã 6 số đã gửi tới số điện thoại của bạn để hoàn tất xác thực danh tính.
                </p>
                <p className="text-[9px] text-slate-400 mt-[3px]">(Demo: mã OTP là 123456)</p>
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
                  onClick={() => setStep("selfie")}
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

          {step === "success" && (
            <div className="text-center py-[18px] space-y-[12px]">
              <div className="mx-auto w-[48px] h-[48px] rounded-full bg-emerald-50 flex items-center justify-center">
                <Check className="text-emerald-500" size={24} />
              </div>
              <h2 className="text-[14px] font-semibold text-slate-900 tracking-tight">Đã gửi hồ sơ xác thực</h2>
              <p className="text-[12px] text-slate-500 max-w-[280px] mx-auto">
                Hồ sơ KYC của bạn đang được xét duyệt, kết quả sẽ có trong vòng 24 giờ tới.
              </p>
              <button
                onClick={() => navigate("/dashboard")}
                className="mt-[6px] px-[15px] py-[9px] rounded-2xl text-[12px] font-medium bg-slate-900 hover:bg-slate-800 text-white transition-colors"
              >
                Về trang tổng quan
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
