import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Landmark, Lock, User } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!username || !password) {
      setError("Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.");
      return;
    }
    // Mock auth: any non-empty credentials succeed
    navigate("/dashboard");
  }

  return (
    <div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center px-[12px]">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-[18px]">
          <div className="w-[42px] h-[42px] rounded-2xl bg-gradient-to-br from-slate-800 to-slate-950 flex items-center justify-center shadow-[0_8px_20px_-6px_rgba(0,0,0,0.3)]">
            <Landmark className="text-white" size={20} strokeWidth={2} />
          </div>
          <h1 className="mt-[12px] text-[20px] font-semibold text-slate-900 tracking-tight">VietBank</h1>
          <p className="text-[12px] text-slate-500 mt-[3px]">Đăng nhập vào tài khoản của bạn</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-3xl shadow-[0_1px_2px_rgba(0,0,0,0.04)] border border-black/5 p-[15px] space-y-[12px]"
        >
          <div>
            <label className="block text-[11px] font-medium text-slate-500 mb-[6px]">Tên đăng nhập</label>
            <div className="relative">
              <User className="absolute left-[12px] top-1/2 -translate-y-1/2 text-slate-400" size={13} />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Nhập tên đăng nhập"
                className="w-full pl-[33px] pr-[12px] py-[9px] rounded-2xl bg-slate-100 border-0 text-[12px] font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-500 mb-[6px]">Mật khẩu</label>
            <div className="relative">
              <Lock className="absolute left-[12px] top-1/2 -translate-y-1/2 text-slate-400" size={13} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu"
                className="w-full pl-[33px] pr-[12px] py-[9px] rounded-2xl bg-slate-100 border-0 text-[12px] font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
              />
            </div>
          </div>

          {error && <p className="text-[11px] text-red-500 font-medium">{error}</p>}

          <button
            type="submit"
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-[10px] rounded-2xl text-[12px] transition-colors"
          >
            Đăng nhập
          </button>

          <p className="text-[10px] text-center text-slate-400 pt-[3px]">
            Demo UI — dùng bất kỳ thông tin nào để đăng nhập
          </p>
        </form>
      </div>
    </div>
  );
}
