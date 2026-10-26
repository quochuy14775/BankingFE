import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { ArrowDownLeft, Receipt, ShieldCheck, Target, Wallet } from "lucide-react";

export type NotificationType = "transaction" | "bill" | "goal" | "security" | "system";

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  time: string;
  read: boolean;
}

interface NotificationContextValue {
  notifications: AppNotification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  addNotification: (input: Omit<AppNotification, "id" | "read">) => void;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

let idCounter = 0;
function nextId() {
  idCounter += 1;
  return `noti-${Date.now()}-${idCounter}`;
}

const SEED_NOTIFICATIONS: AppNotification[] = [
  {
    id: "n1",
    type: "transaction",
    title: "Nhận tiền thành công",
    message: "Tài khoản của bạn vừa nhận +2.500.000đ từ Nguyễn Văn A.",
    time: "5 phút trước",
    read: false,
  },
  {
    id: "n2",
    type: "bill",
    title: "Hóa đơn sắp đến hạn",
    message: "Hóa đơn tiền điện 850.000đ sẽ đến hạn thanh toán trong 2 ngày.",
    time: "2 giờ trước",
    read: false,
  },
  {
    id: "n3",
    type: "goal",
    title: "Gần đạt mục tiêu",
    message: "Mục tiêu \"Du lịch Nhật Bản\" đã hoàn thành 45% chặng đường.",
    time: "1 ngày trước",
    read: false,
  },
  {
    id: "n4",
    type: "security",
    title: "Đăng nhập từ thiết bị mới",
    message: "Tài khoản của bạn vừa đăng nhập trên một thiết bị mới tại Hà Nội.",
    time: "2 ngày trước",
    read: true,
  },
];

export const notificationIcon: Record<NotificationType, LucideIcon> = {
  transaction: ArrowDownLeft,
  bill: Receipt,
  goal: Target,
  security: ShieldCheck,
  system: Wallet,
};

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<AppNotification[]>(SEED_NOTIFICATIONS);

  const value = useMemo<NotificationContextValue>(() => {
    const unreadCount = notifications.filter((n) => !n.read).length;
    return {
      notifications,
      unreadCount,
      markAsRead: (id) => {
        setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
      },
      markAllAsRead: () => {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      },
      addNotification: (input) => {
        setNotifications((prev) => [{ ...input, id: nextId(), read: false }, ...prev]);
      },
    };
  }, [notifications]);

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotifications must be used within NotificationProvider");
  return ctx;
}
