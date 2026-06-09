"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Plus, RotateCcw, Trash2 } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { CategoryIcon } from "@/components/Icon";
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCloudTasks().then((items) => {
      setTasks(items);
      setLoading(false);
    });
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
    <AppShell title="Настройки" subtitle="Добавляй свои действия, убирай лишнее и оставляй только те задачи, которые реально подходят твоей жизни.">
      <div className="grid min-w-0 gap-5 xl:grid-cols-[.92fr_1.08fr]">
        <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="apple-glass min-w-0 rounded-[30px] p-4 sm:rounded-[36px] sm:p-6">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-black text-white"><Plus className="h-5 w-5" /></span>
            <div className="min-w-0">
              <p className="text-sm text-neutral-500">Добавить своё задание</p>
              <h2 className="text-2xl font-black tracking-tight">Своя цель дня</h2>
            </div>
          </div>

          <div className="mt-5 grid gap-3">
            <select value={category} onChange={(e) => setCategory(e.target.value as CategoryKey)} className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none">
              {categories.map((item) => <option key={item.key} value={item.key}>{item.title}</option>)}
            </select>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Например: сделать 3 звонка клиентам" className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none focus:border-[#0A84FF]" />
            <div className="grid grid-cols-2 gap-3">
              <input value={points} onChange={(e) => setPoints(e.target.value)} inputMode="numeric" placeholder="+ баллы" className="w-full min-w-0 rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none focus:border-[#0A84FF]" />
              <input value={penalty} onChange={(e) => setPenalty(e.target.value)} inputMode="numeric" placeholder="- баллы" className="w-full min-w-0 rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none focus:border-[#0A84FF]" />
            </div>
            <button onClick={addTask} className="w-full rounded-2xl bg-black px-5 py-4 font-bold text-white transition active:scale-[.98]">Добавить задание</button>
          </div>

          <div className="mt-5 rounded-[26px] bg-white p-4 text-sm text-neutral-500">
            <p className="font-bold text-black">Как работает удаление</p>
            <p className="mt-1 leading-6">Любое стандартное или своё задание можно убрать. В Supabase оно скрывается, а не стирается жёстко, чтобы история отметок не ломалась.</p>
          </div>
        </motion.section>

        <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 }} className="apple-glass min-w-0 rounded-[30px] p-4 sm:rounded-[36px] sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <p className="text-sm text-neutral-500">Твои задания</p>
              <h2 className="text-2xl font-black tracking-tight">{loading ? "Загружаю..." : `${visibleTasks.length} из ${tasks.length}`}</h2>
            </div>
            <div className="grid grid-cols-1 gap-2 sm:flex sm:flex-wrap sm:justify-end">
              <button onClick={restoreDefaults} disabled={restoring} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-bold transition active:scale-[.98] disabled:opacity-60">
                <RotateCcw className="h-4 w-4" />
                {restoring ? "Возвращаю..." : "Вернуть стандартные"}
              </button>
              <button onClick={reset} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-neutral-100 px-4 py-3 text-sm font-bold transition active:scale-[.98]">
                <Trash2 className="h-4 w-4" />
                Сбросить демо
              </button>
            </div>
          </div>

          <div className="no-scrollbar mt-5 flex gap-2 overflow-x-auto pb-1">
            <button onClick={() => setFilter("all")} className={`shrink-0 rounded-2xl px-4 py-2 text-sm font-bold ${filter === "all" ? "bg-black text-white" : "bg-white"}`}>Все</button>
            {categories.map((item) => (
              <button key={item.key} onClick={() => setFilter(item.key)} className={`inline-flex shrink-0 items-center gap-2 rounded-2xl px-4 py-2 text-sm font-bold ${filter === item.key ? "bg-black text-white" : "bg-white"}`}>
                <CategoryIcon category={item.key} />
                {item.title}
              </button>
            ))}
          </div>

          <div className="mt-5 space-y-2 overflow-visible pr-0 md:max-h-[620px] md:overflow-y-auto md:pr-1">
            {!loading && visibleTasks.length === 0 && (
              <div className="rounded-[24px] bg-white p-5 text-center text-sm leading-6 text-neutral-500">
                Заданий пока нет. Нажми «Вернуть стандартные» или добавь своё задание.
              </div>
            )}

            {visibleTasks.map((task) => (
              <div key={task.id} className="flex min-w-0 flex-col gap-3 rounded-2xl bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="break-words font-bold leading-5">{task.title}</p>
                  <p className="mt-1 text-xs text-neutral-500">{categories.find((c) => c.key === task.category)?.title} · +{task.points} / {task.penalty}</p>
                </div>
                <button
                  onClick={() => removeTask(task)}
                  disabled={removingId === task.id}
                  className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-neutral-100 px-3 py-3 text-xs font-bold transition hover:bg-black hover:text-white active:scale-[.96] disabled:opacity-60 sm:w-auto"
                >
                  <Trash2 className="h-4 w-4" />
                  {removingId === task.id ? "Убираю..." : "Убрать"}
                </button>
              </div>
            ))}
          </div>
        </motion.section>
      </div>
    </AppShell>
  );
}
