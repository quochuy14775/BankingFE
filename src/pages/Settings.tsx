import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { User, Mail, Phone, MapPin, Check, ShieldAlert, ArrowRight, Laptop, Smartphone as PhoneIcon, LogOut, ShieldCheck } from "lucide-react";
import { mockUser } from "../lib/mockData.ts";

interface Device {
  id: string;
  name: string;
  type: "desktop" | "mobile";
  location: string;
  lastActive: string;
  current: boolean;
}

const INITIAL_DEVICES: Device[] = [
  { id: "d1", name: "Chrome trên Windows", type: "desktop", location: "TP. Hồ Chí Minh, Việt Nam", lastActive: "Đang hoạt động", current: true },
  { id: "d2", name: "VietBank App - iPhone 15", type: "mobile", location: "TP. Hồ Chí Minh, Việt Nam", lastActive: "2 giờ trước", current: false },
  { id: "d3", name: "Safari trên MacBook", type: "desktop", location: "Hà Nội, Việt Nam", lastActive: "3 ngày trước", current: false },
];

export default function Settings() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState(mockUser.fullName);
  const [email, setEmail] = useState(mockUser.email);
  const [phone, setPhone] = useState(mockUser.phone);
  const [address, setAddress] = useState(mockUser.address);
  const [saved, setSaved] = useState(false);
  const [devices, setDevices] = useState<Device[]>(INITIAL_DEVICES);

  function revokeDevice(id: string) {
    setDevices((prev) => prev.filter((d) => d.id !== id));
  }

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

      <div className="bg-white rounded-3xl border border-black/5 p-[15px] shadow-[0_1px_2px_rgba(0,0,0,0.04)] mt-[15px]">
        <div className="flex items-center gap-[6px] mb-[3px]">
          <ShieldCheck size={14} className="text-slate-700" />
          <h2 className="text-[13px] font-semibold text-slate-900 tracking-tight">Thiết bị đăng nhập</h2>
        </div>
        <p className="text-[11px] text-slate-500 mb-[12px]">
          Danh sách thiết bị đang đăng nhập vào tài khoản của bạn. Thu hồi ngay nếu phát hiện thiết bị lạ.
        </p>

        <ul className="divide-y divide-slate-100">
          {devices.map((d) => {
            const Icon = d.type === "desktop" ? Laptop : PhoneIcon;
            return (
              <li key={d.id} className="flex items-center gap-[10px] py-[12px]">
                <span
                  className={`w-[34px] h-[34px] rounded-full flex items-center justify-center shrink-0 ${
                    d.current ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-600"
                  }`}
                >
                  <Icon size={15} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[12px] font-medium text-slate-900 truncate">
                    {d.name}
                    {d.current && (
                      <span className="ml-[6px] px-[6px] py-[1px] rounded-full bg-emerald-50 text-emerald-600 text-[9px] font-semibold align-middle">
                        Thiết bị này
                      </span>
                    )}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-[2px]">
                    {d.location} · {d.lastActive}
                  </p>
                </div>
                {!d.current && (
                  <button
                    onClick={() => revokeDevice(d.id)}
                    className="flex items-center gap-[4px] px-[10px] py-[5px] rounded-full bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-600 text-[10px] font-medium transition-colors shrink-0"
                  >
                    <LogOut size={11} />
                    Thu hồi
                  </button>
                )}
              </li>
            );
          })}
          {devices.length === 0 && (
            <li className="py-[16px] text-center text-[11px] text-slate-400">Chỉ còn thiết bị hiện tại đang đăng nhập.</li>
          )}
        </ul>
      </div>
    </div>
  );
}
