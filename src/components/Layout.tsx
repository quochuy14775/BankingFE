import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, ArrowLeftRight, History, LogOut, Landmark, ChevronDown, Settings, PiggyBank, Receipt, Target, CreditCard, Menu, X, QrCode } from "lucide-react";
import { mockUser } from "../lib/mockData";
import NavSearch from "./NavSearch.tsx";
import NotificationBell from "./NotificationBell.tsx";

const navItems = [
  { to: "/dashboard", label: "Tổng quan", icon: LayoutDashboard },
  { to: "/transfer", label: "Chuyển khoản", icon: ArrowLeftRight },
  { to: "/qr-pay", label: "QR Pay", icon: QrCode },
  { to: "/history", label: "Lịch sử giao dịch", icon: History },
  { to: "/budget", label: "Quản lý chi tiêu", icon: PiggyBank },
  { to: "/bills", label: "Hóa đơn", icon: Receipt },
  { to: "/goals", label: "Mục tiêu", icon: Target },
  { to: "/cards", label: "Thẻ", icon: CreditCard },
];

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const navRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const [indicator, setIndicator] = useState({ left: 0, width: 0, ready: false });
  const [mobileOpen, setMobileOpen] = useState(false);

  const activeIndex = navItems.findIndex((item) => location.pathname.startsWith(item.to));

  function measureIndicator() {
    const activeEl = itemRefs.current[activeIndex];
    const containerEl = navRef.current;
    if (!activeEl || !containerEl) return;
    const containerRect = containerEl.getBoundingClientRect();
    const activeRect = activeEl.getBoundingClientRect();
    setIndicator({ left: activeRect.left - containerRect.left, width: activeRect.width, ready: true });
  }

  useLayoutEffect(() => {
    measureIndicator();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex]);

  useEffect(() => {
    const containerEl = navRef.current;
    if (!containerEl) return;
    const observer = new ResizeObserver(() => measureIndicator());
    observer.observe(containerEl);
    itemRefs.current.forEach((el) => el && observer.observe(el));
    window.addEventListener("resize", measureIndicator);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measureIndicator);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex]);

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      <header className="sticky top-0 z-20 backdrop-blur-xl bg-white/70 border-b border-black/5">
        <div className="relative w-full px-[16px] sm:px-[24px] xl:px-[48px] flex items-center justify-between h-[42px]">
          <div className="flex items-center gap-[24px] min-w-0">
            <button
              type="button"
              onClick={() => setMobileOpen((v) => !v)}
              className="md:hidden flex items-center justify-center w-[28px] h-[28px] -ml-[4px] rounded-full hover:bg-black/5 text-slate-700 shrink-0"
              aria-label="Mở menu điều hướng"
            >
              {mobileOpen ? <X size={16} /> : <Menu size={16} />}
            </button>

            <div className="flex items-center gap-[4px] shrink-0">
              <Landmark className="text-slate-900" size={15} strokeWidth={2} />
              <span className="font-semibold text-[13px] text-slate-900 tracking-tight">VietBank</span>
            </div>

            <nav ref={navRef} className="relative hidden md:flex items-center gap-[3px]">
              <div
                className="absolute top-0 h-full rounded-full bg-slate-900 transition-all duration-300 ease-out"
                style={{
                  left: indicator.left,
                  width: indicator.width,
                  opacity: indicator.ready ? 1 : 0,
                }}
              />
              {navItems.map(({ to, label, icon: Icon }, i) => (
                <NavLink
                  key={to}
                  to={to}
                  ref={(el) => {
                    itemRefs.current[i] = el;
                  }}
                  className={({ isActive }) =>
                    `relative z-10 flex items-center gap-[4px] px-[9px] py-[4px] rounded-full text-[11px] font-medium whitespace-nowrap transition-colors duration-300 ${
                      isActive ? "text-white" : "text-slate-600 hover:bg-black/5"
                    }`
                  }
                >
                  <Icon size={10} strokeWidth={2} />
                  {label}
                </NavLink>
              ))}
            </nav>
          </div>

          <NavSearch />

          <div className="flex items-center gap-[9px] shrink-0">
            <NotificationBell />
            <div className="group relative">
              <button className="flex items-center gap-[6px] pl-[3px] pr-[6px] py-[3px] rounded-full hover:bg-black/5 transition-colors">
                <span className="w-[21px] h-[21px] rounded-full bg-gradient-to-br from-slate-700 to-slate-900 text-white flex items-center justify-center text-[10px] font-semibold shrink-0">
                  {mockUser.fullName.split(" ").pop()?.[0]}
                </span>
                <span className="text-[11px] font-medium text-slate-700 hidden sm:inline">
                  {mockUser.fullName}
                </span>
                <ChevronDown size={10} className="text-slate-400 hidden sm:block" />
              </button>

              <div className="absolute right-0 mt-[3px] w-[210px] max-w-[calc(100vw-32px)] rounded-2xl bg-white shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-black/5 p-[4px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                <div className="px-[9px] py-[6px]">
                  <p className="text-[11px] font-medium text-slate-900">{mockUser.fullName}</p>
                  <p className="text-xs text-slate-400 truncate">{mockUser.email}</p>
                </div>
                <div className="h-[1px] bg-black/5 my-[3px]" />
                <button
                  onClick={() => navigate("/settings")}
                  className="flex items-center gap-[6px] px-[9px] py-[6px] w-full rounded-xl text-[11px] font-medium text-slate-600 hover:bg-black/5"
                >
                  <Settings size={11} />
                  Cài đặt thông tin cá nhân
                </button>
                <div className="h-[1px] bg-black/5 my-[3px]" />
                <button
                  onClick={() => navigate("/")}
                  className="flex items-center gap-[6px] px-[9px] py-[6px] w-full rounded-xl text-[11px] font-medium text-slate-600 hover:bg-black/5"
                >
                  <LogOut size={11} />
                  Đăng xuất
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile nav drawer */}
        <div
          className={`md:hidden overflow-hidden transition-[max-height] duration-300 ease-out border-t border-black/5 bg-white/95 ${
            mobileOpen ? "max-h-[420px]" : "max-h-0 border-t-0"
          }`}
        >
          <nav className="flex flex-col p-[8px] gap-[2px]">
            {navItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-[9px] px-[12px] py-[9px] rounded-xl text-[13px] font-medium transition-colors ${
                    isActive ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-black/5"
                  }`
                }
              >
                <Icon size={14} strokeWidth={2} />
                {label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main className="w-full px-[16px] sm:px-[24px] xl:px-[48px] py-[15px]">{children}</main>
    </div>
  );
}
