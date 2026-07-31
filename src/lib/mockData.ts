export interface Account {
  id: string;
  label: string;
  number: string;
  balance: number;
  monthChange?: number;
  interestRate?: number;
  maturityDate?: string;
}

export interface Contact {
  id: string;
  name: string;
  bank: string;
  number: string;
}

export type TransactionType = "in" | "out";

export interface Transaction {
  id: string;
  date: string;
  type: TransactionType;
  desc: string;
  amount: number;
}

export const mockUser = {
  fullName: "Nguyễn Văn An",
  accountNumber: "1903 8888 1234",
  email: "an.nguyen@example.com",
  phone: "0912 345 678",
  address: "12 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh",
  cardExpiry: "12/28",
};

export const mockAccounts: Account[] = [
  { id: "acc-1", label: "Tài khoản thanh toán", number: "1903 8888 1234", balance: 45230000, monthChange: 2450000 },
  {
    id: "acc-2",
    label: "Tài khoản tiết kiệm",
    number: "1903 8888 5678",
    balance: 120000000,
    interestRate: 5.5,
    maturityDate: "15/12/2026",
  },
];

export const mockContacts: Contact[] = [
  { id: "c1", name: "Trần Thị Bình", bank: "Vietcombank", number: "0071 0012 3456" },
  { id: "c2", name: "Lê Hoàng Cường", bank: "Techcombank", number: "1902 4455 6677" },
  { id: "c3", name: "Phạm Thu Hà", bank: "MB Bank", number: "0333 8899 0011" },
];

export const mockTransactions: Transaction[] = [
  { id: "t1", date: "2026-07-30", type: "out", desc: "Chuyển khoản - Trần Thị Bình", amount: 2000000 },
  { id: "t2", date: "2026-07-29", type: "in", desc: "Nhận lương tháng 7", amount: 18000000 },
  { id: "t3", date: "2026-07-28", type: "out", desc: "Thanh toán hóa đơn điện", amount: 850000 },
  { id: "t4", date: "2026-07-26", type: "out", desc: "Chuyển khoản - Lê Hoàng Cường", amount: 500000 },
  { id: "t5", date: "2026-07-24", type: "in", desc: "Hoàn tiền mua sắm", amount: 120000 },
  { id: "t6", date: "2026-07-20", type: "out", desc: "Thanh toán thẻ tín dụng", amount: 3200000 },
];

export interface SpendingPoint {
  label: string;
  amount: number;
}

export interface Bill {
  id: string;
  name: string;
  dueLabel: string;
  amount: number;
}

export interface FinancialGoal {
  id: string;
  name: string;
  current: number;
  target: number;
}

export const mockSpendingTrend: SpendingPoint[] = [
  { label: "T2", amount: 320000 },
  { label: "T3", amount: 540000 },
  { label: "T4", amount: 210000 },
  { label: "T5", amount: 780000 },
  { label: "T6", amount: 460000 },
  { label: "T7", amount: 950000 },
  { label: "CN", amount: 380000 },
];

export const mockBills: Bill[] = [
  { id: "b1", name: "Internet FPT", dueLabel: "Còn 2 ngày", amount: 250000 },
  { id: "b2", name: "Điện lực EVN", dueLabel: "Còn 4 ngày", amount: 620000 },
  { id: "b3", name: "Netflix", dueLabel: "Còn 7 ngày", amount: 99000 },
];

export const mockGoals: FinancialGoal[] = [
  { id: "g1", name: "Du lịch Nhật Bản", current: 22500000, target: 50000000 },
  { id: "g2", name: "Mua xe ô tô", current: 390000000, target: 600000000 },
];

export function formatVND(amount: number): string {
  return amount.toLocaleString("vi-VN") + " ₫";
}

const ACCOUNT_NAME_POOL = [
  "Nguyễn Minh Tuấn",
  "Trần Thị Lan",
  "Phạm Quốc Việt",
  "Đỗ Thị Hương",
  "Vũ Đình Long",
  "Ngô Thị Mai",
];

export interface ExtractedIdInfo {
  fullName: string;
  idNumber: string;
  dob: string;
  gender: string;
  address: string;
  issueDate: string;
  expiryDate: string;
}

export function extractIdChipInfo(): ExtractedIdInfo {
  return {
    fullName: mockUser.fullName,
    idNumber: "079203004521",
    dob: "12/05/2003",
    gender: "Nam",
    address: mockUser.address,
    issueDate: "10/03/2021",
    expiryDate: "12/05/2028",
  };
}

export function resolveAccountName(accountNumber: string): string {
  const digits = accountNumber.replace(/\D/g, "");
  if (digits.length < 6) return "";
  let hash = 0;
  for (const ch of digits) hash = (hash * 31 + ch.charCodeAt(0)) % ACCOUNT_NAME_POOL.length;
  return ACCOUNT_NAME_POOL[hash];
}
