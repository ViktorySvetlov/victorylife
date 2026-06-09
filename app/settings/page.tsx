"use client";

import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { categories } from "@/lib/defaults";
import { addCloudTask, getCloudTasks, removeCloudTask, resetVictoryLifeData, restoreDefaultCloudTasks } from "@/lib/cloudStore";
import { CategoryKey, Task } from "@/lib/types";

export default function SettingsPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [category, setCategory] = useState<CategoryKey>("work");
  const [title, setTitle] = useState("");
  const [points, setPoints] = useState("10");
  const [penalty, setPenalty] = useState("0");
  const [filter, setFilter] = useState<CategoryKey | "all">("all");
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [restoring, setRestoring] = useState(false);

  useEffect(() => {
    getCloudTasks().then(setTasks);
  }, []);

  const visibleTasks = useMemo(() => {
    return filter === "all" ? tasks : tasks.filter((task) => task.category === filter);
  }, [filter, tasks]);

  async function addTask() {
    if (!title.trim()) return;
    const next = await addCloudTask({
      category,
      title: title.trim(),
      points: Number(points) || 0,
      penalty: Number(penalty) || 0,
    });
    setTasks(next);
    setTitle("");
  }

  async function removeTask(task: Task) {
    const ok = window.confirm(`Убрать задание «${task.title}» из твоего списка? Оно исчезнет из ежедневной отметки.`);
    if (!ok) return;

    setRemovingId(task.id);
    const next = await removeCloudTask(task.id);
    setTasks(next);
    setRemovingId(null);
  }

  async function restoreDefaults() {
    setRestoring(true);
    const next = await restoreDefaultCloudTasks();
    setTasks(next);
    setRestoring(false);
  }

  async function reset() {
    const ok = window.confirm("Сбросить демо? Это удалит отметки дней, цели, достижения и вернёт стандартные задания.");
    if (!ok) return;
    await resetVictoryLifeData();
    location.reload();
  }

  return (
    <AppShell title="Настройки" subtitle="Настрой VictoryLife под себя: оставь только те задания, которые реально подходят твоей жизни.">
      <div className="grid gap-5 lg:grid-cols-[.9fr_1.1fr]">
        <div className="apple-glass rounded-[36px] p-6">
          <p className="text-sm text-neutral-500">Добавить своё задание</p>
          <h2 className="mt-1 text-2xl font-black tracking-tight">Своя цель дня</h2>
          <div className="mt-4 grid gap-3">
            <select value={category} onChange={(e) => setCategory(e.target.value as CategoryKey)} className="rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none">
              {categories.map((item) => <option key={item.key} value={item.key}>{item.title}</option>)}
            </select>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Например: сделать 3 звонка клиентам" className="rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none focus:border-[#0A84FF]" />
            <div className="grid grid-cols-2 gap-3">
              <input value={points} onChange={(e) => setPoints(e.target.value)} placeholder="+ баллы" className="rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none focus:border-[#0A84FF]" />
              <input value={penalty} onChange={(e) => setPenalty(e.target.value)} placeholder="- баллы" className="rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none focus:border-[#0A84FF]" />
            </div>
            <button onClick={addTask} className="rounded-2xl bg-black px-5 py-4 font-bold text-white transition active:scale-[.98]">Добавить задание</button>
          </div>

          <div className="mt-5 rounded-[28px] bg-white p-4 text-sm text-neutral-500">
            <p className="font-bold text-black">Удаление лишних задач</p>
            <p className="mt-1">Теперь можно убрать любое стандартное или своё задание. В Supabase оно не стирается жёстко, а скрывается из ежедневного списка, чтобы не ломать историю.</p>
          </div>
        </div>

        <div className="apple-glass rounded-[36px] p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm text-neutral-500">Все задания</p>
              <h2 className="text-2xl font-black tracking-tight">{visibleTasks.length} из {tasks.length}</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              <button onClick={restoreDefaults} disabled={restoring} className="rounded-2xl bg-white px-4 py-3 text-sm font-bold transition active:scale-[.98] disabled:opacity-60">
                {restoring ? "Возвращаю..." : "Вернуть стандартные"}
              </button>
              <button onClick={reset} className="rounded-2xl bg-neutral-100 px-4 py-3 text-sm font-bold transition active:scale-[.98]">Сбросить демо</button>
            </div>
          </div>

          <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
            <button onClick={() => setFilter("all")} className={`shrink-0 rounded-2xl px-4 py-2 text-sm font-bold ${filter === "all" ? "bg-black text-white" : "bg-white"}`}>Все</button>
            {categories.map((item) => (
              <button key={item.key} onClick={() => setFilter(item.key)} className={`shrink-0 rounded-2xl px-4 py-2 text-sm font-bold ${filter === item.key ? "bg-black text-white" : "bg-white"}`}>{item.title}</button>
            ))}
          </div>

          <div className="mt-5 max-h-[620px] space-y-2 overflow-y-auto pr-1">
            {visibleTasks.length === 0 && (
              <div className="rounded-[24px] bg-white p-5 text-center text-sm text-neutral-500">В этой категории заданий пока нет. Добавь своё или верни стандартные.</div>
            )}

            {visibleTasks.map((task) => (
              <div key={task.id} className="flex items-center justify-between gap-3 rounded-2xl bg-white p-3">
                <div>
                  <p className="font-bold">{task.title}</p>
                  <p className="text-xs text-neutral-500">{categories.find((c) => c.key === task.category)?.title} · +{task.points} / {task.penalty}</p>
                </div>
                <button
                  onClick={() => removeTask(task)}
                  disabled={removingId === task.id}
                  className="shrink-0 rounded-xl bg-neutral-100 px-3 py-2 text-xs font-bold transition hover:bg-black hover:text-white active:scale-[.96] disabled:opacity-60"
                >
                  {removingId === task.id ? "Убираю..." : "Убрать"}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
