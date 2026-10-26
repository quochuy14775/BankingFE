import { useEffect, useRef, useState } from "react";
import { Bell, CheckCheck } from "lucide-react";
import { notificationIcon, useNotifications } from "../lib/notificationStore.tsx";

export default function NotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const hasUnread = unreadCount > 0;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative flex items-center justify-center w-[28px] h-[28px] rounded-full hover:bg-black/5 transition-colors"
        aria-label="Thông báo"
      >
        {hasUnread && (
          <>
            <span className="pointer-events-none absolute inset-0 rounded-full bg-fuchsia-500/40 animate-ripple-wave" />
            <span
              className="pointer-events-none absolute inset-0 rounded-full bg-fuchsia-500/40 animate-ripple-wave"
              style={{ animationDelay: "0.7s" }}
            />
          </>
        )}
        <Bell size={14} className={`relative text-slate-700 ${hasUnread ? "animate-bell-ring" : ""}`} />
        {hasUnread && (
          <span className="absolute -top-[1px] -right-[1px] min-w-[14px] h-[14px] px-[3px] rounded-full bg-fuchsia-600 text-white text-[9px] font-semibold flex items-center justify-center ring-2 ring-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      <div
        className={`absolute right-0 mt-[6px] w-[300px] max-w-[calc(100vw-32px)] rounded-2xl bg-white shadow-[0_16px_40px_rgba(0,0,0,0.16)] border border-black/5 overflow-hidden transition-all duration-200 origin-top-right ${
          open ? "opacity-100 scale-100 visible" : "opacity-0 scale-95 invisible"
        }`}
      >
        <div className="flex items-center justify-between px-[12px] py-[9px] border-b border-black/5">
          <p className="text-[12px] font-semibold text-slate-900">Thông báo</p>
          {hasUnread && (
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-[3px] text-[10px] font-medium text-slate-500 hover:text-slate-900 transition-colors"
            >
              <CheckCheck size={11} />
              Đánh dấu đã đọc
            </button>
          )}
        </div>

        <div className="max-h-[360px] overflow-y-auto">
          {notifications.length === 0 ? (
            <p className="px-[12px] py-[24px] text-center text-[11px] text-slate-400">Không có thông báo nào.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {notifications.map((n) => {
                const Icon = notificationIcon[n.type];
                return (
                  <li key={n.id}>
                    <button
                      onClick={() => markAsRead(n.id)}
                      className={`w-full flex items-start gap-[9px] px-[12px] py-[10px] text-left transition-colors hover:bg-slate-50 ${
                        n.read ? "" : "bg-fuchsia-50/40"
                      }`}
                    >
                      <span className="relative w-[26px] h-[26px] rounded-full bg-slate-100 flex items-center justify-center text-slate-600 shrink-0 mt-[1px]">
                        <Icon size={12} />
                        {!n.read && (
                          <span className="absolute -top-[1px] -right-[1px] w-[7px] h-[7px] rounded-full bg-fuchsia-500 ring-2 ring-white" />
                        )}
                      </span>
                      <span className="min-w-0 flex-1">
                        <p className={`text-[11px] ${n.read ? "font-medium text-slate-700" : "font-semibold text-slate-900"}`}>
                          {n.title}
                        </p>
                        <p className="text-[10px] text-slate-500 mt-[2px] leading-[1.4]">{n.message}</p>
                        <p className="text-[9px] text-slate-400 mt-[3px]">{n.time}</p>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
