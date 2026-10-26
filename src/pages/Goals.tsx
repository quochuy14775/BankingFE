import { useState, type FormEvent, type ReactNode } from "react";
import { Plus, Target, Trash2, Wallet, Pencil } from "lucide-react";
import { formatVND } from "../lib/mockData.ts";
import { useGoals, type FinancialGoal } from "../lib/goalStore.tsx";
import { AnimatedProgressBar, useCountUp } from "../components/GoalProgress.tsx";

function GoalListItem({
  goal,
  reached,
  children,
}: {
  goal: FinancialGoal;
  reached: boolean;
  children: (animatedCurrent: number) => ReactNode;
}) {
  const animatedCurrent = useCountUp(goal.current);
  const pct = Math.min((animatedCurrent / goal.target) * 100, 100);

  return (
    <li className="group py-[14px]">
      <div className="flex items-center justify-between mb-[8px]">
        <div>
          <p className="text-[13px] font-medium text-slate-900">{goal.name}</p>
          {goal.deadline && <p className="text-[10px] text-slate-400 mt-[2px]">Hạn: {goal.deadline}</p>}
        </div>
        <span className={`text-[11px] font-semibold tabular-nums transition-colors duration-300 ${reached ? "text-emerald-600" : "text-slate-400"}`}>
          {Math.round(pct)}%
        </span>
      </div>

      <AnimatedProgressBar pct={pct} isDone={reached} />

      {children(animatedCurrent)}
    </li>
  );
}

export default function Goals() {
  const { goals, addGoal, removeGoal, deposit, updateGoal } = useGoals();

  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [deadline, setDeadline] = useState("");
  const [formError, setFormError] = useState("");

  const [depositId, setDepositId] = useState<string | null>(null);
  const [depositAmount, setDepositAmount] = useState("");

  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editTarget, setEditTarget] = useState("");
  const [editDeadline, setEditDeadline] = useState("");

  function handleAddGoal(e: FormEvent) {
    e.preventDefault();
    const trimmedName = name.trim();
    const parsedTarget = Number(target);

    if (!trimmedName) {
      setFormError("Vui lòng nhập tên mục tiêu.");
      return;
    }
    if (!target || !Number.isFinite(parsedTarget) || parsedTarget <= 0) {
      setFormError("Số tiền mục tiêu không hợp lệ.");
      return;
    }

    addGoal({ name: trimmedName, target: parsedTarget, deadline: deadline || undefined });
    setName("");
    setTarget("");
    setDeadline("");
    setFormError("");
  }

  function openDeposit(id: string) {
    setDepositId(id);
    setDepositAmount("");
  }

  function confirmDeposit() {
    if (!depositId) return;
    const amount = Number(depositAmount);
    if (!Number.isFinite(amount) || amount <= 0) return;
    deposit(depositId, amount);
    setDepositId(null);
    setDepositAmount("");
  }

  function openEdit(id: string) {
    const g = goals.find((x) => x.id === id);
    if (!g) return;
    setEditId(id);
    setEditName(g.name);
    setEditTarget(String(g.target));
    setEditDeadline(g.deadline ?? "");
  }

  function confirmEdit() {
    if (!editId) return;
    const trimmedName = editName.trim();
    const parsedTarget = Number(editTarget);
    if (!trimmedName || !Number.isFinite(parsedTarget) || parsedTarget <= 0) return;
    updateGoal(editId, { name: trimmedName, target: parsedTarget, deadline: editDeadline || undefined });
    setEditId(null);
  }

  return (
    <>
      <div className="pointer-events-none fixed top-[60px] left-1/5 w-[288px] h-[288px] rounded-full bg-indigo-200/15 blur-3xl -z-10 animate-ambient-pulse" />
      <div
        className="pointer-events-none fixed bottom-[30px] right-1/5 w-[288px] h-[288px] rounded-full bg-sky-200/15 blur-3xl -z-10 animate-ambient-pulse"
        style={{ animationDelay: "3s" }}
      />

      <h1 className="text-[22px] font-semibold text-slate-900 tracking-tight mb-[3px]">Mục tiêu tài chính</h1>
      <p className="text-slate-500 mb-[18px] text-[13px]">
        Tạo và theo dõi các mục tiêu tiết kiệm, nạp tiền vào mục tiêu để đạt được ước mơ của bạn.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-[12px]">
        {/* Goal list */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-3xl border border-black/5 p-[15px] shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
            <h2 className="flex items-center gap-[6px] text-[14px] font-semibold text-slate-900 tracking-tight mb-[12px]">
              <Target size={13} />
              Danh sách mục tiêu
            </h2>

            {goals.length === 0 ? (
              <p className="text-[11px] text-slate-400 text-center py-[20px]">Chưa có mục tiêu nào.</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {goals.map((goal) => {
                  const reached = goal.current >= goal.target;
                  return (
                    <GoalListItem key={goal.id} goal={goal} reached={reached}>
                      {(animatedCurrent) => (
                      <div className="flex items-center justify-between mt-[6px]">
                        <p className="text-[10px] text-slate-400 tabular-nums">
                          {formatVND(Math.round(animatedCurrent))} / {formatVND(goal.target)}
                        </p>
                        <div className="flex items-center gap-[6px]">
                          {reached && (
                            <span className="text-[10px] font-medium text-emerald-600">Đã đạt mục tiêu</span>
                          )}
                          <button
                            onClick={() => openDeposit(goal.id)}
                            disabled={reached}
                            className="flex items-center gap-[3px] px-[10px] py-[4px] rounded-full bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-slate-900 text-white text-[10px] font-medium transition-colors"
                          >
                            <Wallet size={10} />
                            Nạp tiền
                          </button>
                          <button
                            onClick={() => openEdit(goal.id)}
                            className="text-slate-400 hover:text-slate-700 transition-colors"
                            title="Sửa mục tiêu"
                          >
                            <Pencil size={13} />
                          </button>
                          <button
                            onClick={() => removeGoal(goal.id)}
                            className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-all"
                            title="Xóa mục tiêu"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                      )}
                    </GoalListItem>
                  );
                })}
              </ul>
            )}
          </div>
        </div>

        {/* Add goal form */}
        <div className="bg-white rounded-3xl border border-black/5 p-[15px] shadow-[0_1px_2px_rgba(0,0,0,0.04)] h-fit">
          <h2 className="flex items-center gap-[6px] text-[13px] font-semibold text-slate-900 tracking-tight mb-[12px]">
            <Plus size={13} />
            Tạo mục tiêu mới
          </h2>
          <form onSubmit={handleAddGoal} className="space-y-[10px]">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Tên mục tiêu (VD: Du lịch Nhật Bản)"
              className="w-full px-[12px] py-[9px] rounded-2xl bg-slate-100 border-0 text-[12px] font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
            />

            <input
              type="number"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder="Số tiền mục tiêu (VNĐ)"
              min="0"
              className="w-full px-[12px] py-[9px] rounded-2xl bg-slate-100 border-0 text-[12px] font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
            />

            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full px-[12px] py-[9px] rounded-2xl bg-slate-100 border-0 text-[12px] font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
            />

            {formError && <p className="text-[11px] text-red-500 font-medium">{formError}</p>}

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-[6px] py-[9px] rounded-2xl text-[12px] font-medium bg-slate-900 hover:bg-slate-800 text-white transition-colors"
            >
              <Plus size={12} />
              Tạo mục tiêu
            </button>
          </form>
        </div>
      </div>

      {/* Deposit modal */}
      {depositId && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/30 backdrop-blur-sm px-[16px]">
          <div className="bg-white rounded-3xl border border-black/5 shadow-[0_20px_60px_rgba(0,0,0,0.2)] p-[20px] w-full max-w-[360px]">
            {(() => {
              const g = goals.find((x) => x.id === depositId);
              if (!g) return null;
              return (
                <>
                  <h3 className="text-[15px] font-semibold text-slate-900 mb-[6px]">Nạp tiền vào mục tiêu</h3>
                  <p className="text-[12px] text-slate-500 mb-[14px]">
                    Nạp tiền cho <span className="font-medium text-slate-900">{g.name}</span> (còn thiếu{" "}
                    {formatVND(Math.max(g.target - g.current, 0))})
                  </p>
                  <input
                    type="number"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    placeholder="Số tiền (VNĐ)"
                    min="0"
                    autoFocus
                    className="w-full px-[12px] py-[9px] rounded-2xl bg-slate-100 border-0 text-[12px] font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 mb-[14px]"
                  />
                  <div className="flex gap-[8px]">
                    <button
                      onClick={() => setDepositId(null)}
                      className="flex-1 py-[9px] rounded-2xl text-[12px] font-medium bg-slate-100 hover:bg-slate-200/70 text-slate-700 transition-colors"
                    >
                      Hủy
                    </button>
                    <button
                      onClick={confirmDeposit}
                      className="flex-1 py-[9px] rounded-2xl text-[12px] font-medium bg-slate-900 hover:bg-slate-800 text-white transition-colors"
                    >
                      Xác nhận
                    </button>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* Edit modal */}
      {editId && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/30 backdrop-blur-sm px-[16px]">
          <div className="bg-white rounded-3xl border border-black/5 shadow-[0_20px_60px_rgba(0,0,0,0.2)] p-[20px] w-full max-w-[360px]">
            <h3 className="text-[15px] font-semibold text-slate-900 mb-[12px]">Sửa mục tiêu</h3>
            <div className="space-y-[10px] mb-[14px]">
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Tên mục tiêu"
                className="w-full px-[12px] py-[9px] rounded-2xl bg-slate-100 border-0 text-[12px] font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
              />
              <input
                type="number"
                value={editTarget}
                onChange={(e) => setEditTarget(e.target.value)}
                placeholder="Số tiền mục tiêu (VNĐ)"
                min="0"
                className="w-full px-[12px] py-[9px] rounded-2xl bg-slate-100 border-0 text-[12px] font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
              />
              <input
                type="date"
                value={editDeadline}
                onChange={(e) => setEditDeadline(e.target.value)}
                className="w-full px-[12px] py-[9px] rounded-2xl bg-slate-100 border-0 text-[12px] font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
              />
            </div>
            <div className="flex gap-[8px]">
              <button
                onClick={() => setEditId(null)}
                className="flex-1 py-[9px] rounded-2xl text-[12px] font-medium bg-slate-100 hover:bg-slate-200/70 text-slate-700 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={confirmEdit}
                className="flex-1 py-[9px] rounded-2xl text-[12px] font-medium bg-slate-900 hover:bg-slate-800 text-white transition-colors"
              >
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
