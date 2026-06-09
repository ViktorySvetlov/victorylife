"use client";

import { Goal } from "@/lib/types";

export function GoalCard({ goal, current = 0 }: { goal: Goal; current?: number }) {
  const pct = Math.min(100, Math.round((current / Math.max(1, goal.target)) * 100));
  const unit = goal.unit === "rub" ? "₽" : goal.unit === "points" ? "баллов" : "";
  return (
    <div className="apple-glass rounded-[30px] p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[.18em] text-neutral-400">{goal.type === "daily" ? "День" : goal.type === "monthly" ? "Месяц" : "Год"}</p>
          <h3 className="mt-2 text-xl font-black tracking-tight">{goal.title}</h3>
        </div>
        <span className="rounded-full bg-black px-3 py-1 text-xs font-semibold text-white">{pct}%</span>
      </div>
      <div className="mt-5 h-3 overflow-hidden rounded-full bg-neutral-200">
        <div className="h-full rounded-full bg-[#0A84FF] transition-all duration-700" style={{ width: `${pct}%` }} />
      </div>
      <p className="mt-3 text-sm text-neutral-500">{current.toLocaleString("ru-RU")} / {goal.target.toLocaleString("ru-RU")} {unit}</p>
    </div>
  );
}
