"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { GoalCard } from "@/components/GoalCard";
import { getGoals, getLogs, getTasks, saveGoals } from "@/lib/store";
import { recommendedDailyGoal, totalScore } from "@/lib/points";
import { Goal, Task, DayLog } from "@/lib/types";

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [logs, setLogs] = useState<DayLog[]>([]);
  const [title, setTitle] = useState("");
  const [target, setTarget] = useState("1000000");
  const [type, setType] = useState<Goal["type"]>("yearly");

  useEffect(() => {
    setGoals(getGoals());
    setTasks(getTasks());
    setLogs(getLogs());
  }, []);

  function addGoal() {
    if (!title.trim()) return;
    const next: Goal[] = [...goals, { id: crypto.randomUUID(), type, title: title.trim(), target: Number(target) || 1, unit: type === "daily" ? "points" : "rub" }];
    setGoals(next);
    saveGoals(next);
    setTitle("");
  }

  function autoDailyGoal() {
    const value = recommendedDailyGoal(logs, tasks);
    const next = goals.map((goal) => goal.type === "daily" ? { ...goal, target: value, title: `Цель дня: ${value} баллов` } : goal);
    setGoals(next);
    saveGoals(next);
  }

  const allPoints = totalScore(logs, tasks);

  return (
    <AppShell title="Цели" subtitle="Дневная цель по баллам, месячные и годовые ориентиры.">
      <div className="mb-5 grid gap-5 lg:grid-cols-[.9fr_1.1fr]">
        <div className="dark-card rounded-[32px] p-6">
          <p className="text-sm text-white/55">Автоцель</p>
          <h2 className="mt-2 text-3xl font-black tracking-[-0.05em]">Поставить цель исходя из среднего балла</h2>
          <p className="mt-3 text-white/60">Система возьмёт среднее за последние дни и добавит небольшой рост.</p>
          <button onClick={autoDailyGoal} className="mt-5 rounded-3xl bg-white px-6 py-4 font-bold text-black">Рассчитать цель дня</button>
        </div>

        <div className="apple-glass rounded-[32px] p-6">
          <p className="text-sm text-neutral-500">Добавить цель</p>
          <div className="mt-4 grid gap-3 md:grid-cols-[1fr_140px_140px_auto]">
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Например: купить автомобиль" className="rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none focus:border-[#0A84FF]" />
            <input value={target} onChange={(e) => setTarget(e.target.value)} placeholder="Цель" className="rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none focus:border-[#0A84FF]" />
            <select value={type} onChange={(e) => setType(e.target.value as Goal["type"])} className="rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none">
              <option value="daily">День</option>
              <option value="monthly">Месяц</option>
              <option value="yearly">Год</option>
            </select>
            <button onClick={addGoal} className="rounded-2xl bg-black px-5 py-3 font-bold text-white">Добавить</button>
          </div>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {goals.map((goal) => (
          <GoalCard key={goal.id} goal={goal} current={goal.type === "daily" ? Math.min(goal.target, allPoints % Math.max(1, goal.target)) : Math.min(goal.target, goal.current || 0)} />
        ))}
      </div>
    </AppShell>
  );
}
