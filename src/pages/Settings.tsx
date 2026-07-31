import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { User, Mail, Phone, MapPin, Check, ShieldAlert, ArrowRight } from "lucide-react";
import { mockUser } from "../lib/mockData.ts";

export default function Settings() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState(mockUser.fullName);
  const [email, setEmail] = useState(mockUser.email);
  const [phone, setPhone] = useState(mockUser.phone);
  const [address, setAddress] = useState(mockUser.address);
  const [saved, setSaved] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-[18px]">
        <h1 className="text-[21px] font-semibold text-slate-900 tracking-tight mb-[3px]">Thông tin cá nhân</h1>
        <p className="text-slate-500 text-[12px]">Cập nhật thông tin liên hệ và hồ sơ tài khoản của bạn.</p>
      </div>

      <button
        onClick={() => navigate("/kyc")}
        className="w-full flex items-center gap-[12px] bg-white rounded-3xl border border-black/5 p-[15px] mb-[15px] shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] transition-shadow text-left"
      >
        <span className="w-[36px] h-[36px] rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
          <ShieldAlert size={16} />
        </span>
        <span className="flex-1 min-w-0">
          <p className="text-[12px] font-medium text-slate-900">Xác thực danh tính (KYC) chưa hoàn tất</p>
          <p className="text-[10px] text-slate-400 mt-[2px]">Xác thực để mở hạn mức giao dịch cao hơn</p>
        </span>
        <ArrowRight size={15} className="text-slate-400 shrink-0" />
      </button>

      <div className="bg-white rounded-3xl border border-black/5 p-[15px] shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
        <div className="flex items-center gap-[12px] mb-[18px]">
          <span className="w-[42px] h-[42px] rounded-full bg-gradient-to-br from-slate-700 to-slate-900 text-white flex items-center justify-center text-[13px] font-semibold shrink-0">
            {fullName.split(" ").pop()?.[0]}
          </span>
          <div className="min-w-0">
            <p className="text-[13px] font-medium text-slate-900 truncate">{fullName}</p>
            <p className="text-[10px] text-slate-400 font-card-mono">{mockUser.accountNumber}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-[12px]">
          <div>
            <label className="flex items-center gap-[6px] text-[10px] font-medium text-slate-500 mb-[6px]">
              <User size={11} />
              Họ và tên
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-[12px] py-[9px] rounded-2xl bg-slate-100 border-0 text-[12px] font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
            />
          </div>

          <div>
            <label className="flex items-center gap-[6px] text-[10px] font-medium text-slate-500 mb-[6px]">
              <Mail size={11} />
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-[12px] py-[9px] rounded-2xl bg-slate-100 border-0 text-[12px] font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
            />
          </div>

          <div>
            <label className="flex items-center gap-[6px] text-[10px] font-medium text-slate-500 mb-[6px]">
              <Phone size={11} />
              Số điện thoại
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-[12px] py-[9px] rounded-2xl bg-slate-100 border-0 text-[12px] font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
            />
          </div>

          <div>
            <label className="flex items-center gap-[6px] text-[10px] font-medium text-slate-500 mb-[6px]">
              <MapPin size={11} />
              Địa chỉ
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-[12px] py-[9px] rounded-2xl bg-slate-100 border-0 text-[12px] font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
            />
          </div>

          <div className="flex items-center gap-[9px] pt-[6px]">
            <button
              type="submit"
              className="px-[15px] py-[9px] rounded-2xl text-[12px] font-medium text-white transition-transform hover:scale-[1.02]"
              style={{ background: "linear-gradient(135deg, #818cf8, #c026d3)" }}
            >
              Lưu thay đổi
            </button>
            {saved && (
              <span className="flex items-center gap-[4px] text-[11px] font-medium text-emerald-600 animate-step-in">
                <Check size={13} />
                Đã lưu thành công
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
