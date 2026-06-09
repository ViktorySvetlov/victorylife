"use client";

import confetti from "canvas-confetti";
import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { CategoryIcon } from "@/components/Icon";
import { categories } from "@/lib/defaults";
import { getGoals, getLogs, getTasks, upsertLog } from "@/lib/store";
import { recommendedDailyGoal, scoreDay, todayKey } from "@/lib/points";
import { DayLog, Goal, Task, TaskStatus } from "@/lib/types";

export default function TodayPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [logs, setLogs] = useState<DayLog[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [statuses, setStatuses] = useState<Record<string, TaskStatus>>({});
  const [comment, setComment] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const t = getTasks();
    const l = getLogs();
    const g = getGoals();
    const today = l.find((item) => item.date === todayKey());
    setTasks(t);
    setLogs(l);
    setGoals(g);
    setStatuses(today?.statuses || {});
    setComment(today?.comment || "");
  }, []);

  const currentLog: DayLog = { date: todayKey(), statuses, comment, createdAt: new Date().toISOString() };
  const score = scoreDay(currentLog, tasks);
  const dailyGoal = goals.find((item) => item.type === "daily")?.target || recommendedDailyGoal(logs, tasks);
  const progress = Math.min(100, Math.round((score / Math.max(1, dailyGoal)) * 100));

  function setStatus(taskId: string, status: TaskStatus) {
    setStatuses((prev) => ({ ...prev, [taskId]: prev[taskId] === status ? "skip" : status }));
    setSaved(false);
  }

  async function save() {
    const next = upsertLog(currentLog);
    setLogs(next);
    setSaved(true);
    if (score >= dailyGoal) {
      confetti({ particleCount: 130, spread: 85, origin: { y: 0.68 } });
      setTimeout(() => confetti({ particleCount: 90, spread: 110, origin: { y: 0.58 } }), 260);
    }
  }

  return (
    <AppShell title="Сегодня" subtitle="Отметь действия дня, добавь комментарий и собери баллы.">
      <div className="sticky top-3 z-20 mb-5 rounded-[32px] bg-black p-5 text-white shadow-soft md:static">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-white/55">Итог дня</p>
            <p className="text-5xl font-black tracking-[-0.07em]">{score > 0 ? "+" : ""}{score}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-white/55">Цель</p>
            <p className="text-2xl font-black">{dailyGoal}</p>
          </div>
        </div>
        <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/15">
          <div className="h-full rounded-full bg-[#0A84FF] transition-all duration-700" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.25fr_.75fr]">
        <div className="space-y-5">
          {categories.map((category) => {
            const items = tasks.filter((task) => task.category === category.key);
            return (
              <section key={category.key} className="apple-glass rounded-[32px] p-5">
                <div className="mb-4 flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-black text-white"><CategoryIcon category={category.key} /></span>
                  <h2 className="text-2xl font-black tracking-tight">{category.title}</h2>
                </div>
                <div className="grid gap-3">
                  {items.map((task) => {
                    const status = statuses[task.id] || "skip";
                    return (
                      <motion.div key={task.id} layout className="rounded-[24px] bg-white p-4 shadow-[0_10px_30px_rgba(11,11,15,.04)]">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="font-bold">{task.title}</p>
                            <p className="text-sm text-neutral-500">+{task.points} / {task.penalty} баллов</p>
                          </div>
                          <div className="grid grid-cols-2 gap-2 sm:w-[190px]">
                            <button onClick={() => setStatus(task.id, "done")} className={clsx("rounded-2xl px-4 py-3 text-sm font-bold transition", status === "done" ? "bg-[#0A84FF] text-white" : "bg-neutral-100")}>Сделал</button>
                            <button onClick={() => setStatus(task.id, "missed")} className={clsx("rounded-2xl px-4 py-3 text-sm font-bold transition", status === "missed" ? "bg-black text-white" : "bg-neutral-100")}>Нет</button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>

        <aside className="space-y-5">
          <div className="apple-glass rounded-[32px] p-5">
            <p className="text-sm text-neutral-500">Комментарий дня</p>
            <h2 className="mt-1 text-2xl font-black tracking-tight">Мысль для коуча</h2>
            <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Например: сегодня много сделал по работе, но сильно просела энергия..." className="mt-4 min-h-40 w-full resize-none rounded-[24px] border border-black/10 bg-white p-4 outline-none focus:border-[#0A84FF]" />
            <p className="mt-3 text-sm text-neutral-500">Этот комментарий можно отправить в раздел «Твой коуч» для анализа.</p>
          </div>

          <button onClick={save} className="w-full rounded-[28px] bg-black px-6 py-5 text-lg font-black text-white shadow-soft transition active:scale-[.98]">Сохранить день</button>
          <AnimatePresence>
            {saved && <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="rounded-[28px] bg-[#0A84FF] p-5 text-center font-bold text-white">День сохранён. Победа зафиксирована.</motion.div>}
          </AnimatePresence>
        </aside>
      </div>
    </AppShell>
  );
}
