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
  const [adding, setAdding] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  async function loadTasks() {
    setLoading(true);
    setMessage("");

    try {
      const items = await getCloudTasks();
      setTasks(items);
      if (items.length === 0) setMessage("Заданий пока нет. Верни стандартные или добавь своё.");
    } catch (error) {
      console.error("settings loadTasks", error);
      setMessage("Не получилось загрузить задания. Попробуй обновить страницу или вернуть стандартные.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTasks();
  }, []);

  const visibleTasks = useMemo(() => {
    return filter === "all" ? tasks : tasks.filter((task) => task.category === filter);
  }, [filter, tasks]);

  async function addTask() {
    if (!title.trim() || adding) return;

    setAdding(true);
    setMessage("");

    try {
      const next = await addCloudTask({
        category,
        title: title.trim(),
        points: Number(points) || 0,
        penalty: Number(penalty) || 0,
      });
      setTasks(next);
      setTitle("");
      setMessage("Задание добавлено.");
    } catch (error) {
      console.error("settings addTask", error);
      setMessage("Не получилось добавить задание. Попробуй ещё раз.");
    } finally {
      setAdding(false);
    }
  }

  async function removeTask(task: Task) {
    const ok = window.confirm(`Убрать задание «${task.title}» из твоего списка?`);
    if (!ok || removingId) return;

    setRemovingId(task.id);
    setMessage("");

    try {
      const next = await removeCloudTask(task.id);
      setTasks(next);
      setMessage("Задание убрано.");
    } catch (error) {
      console.error("settings removeTask", error);
      setMessage("Не получилось убрать задание. Попробуй ещё раз.");
    } finally {
      setRemovingId(null);
    }
  }

  async function restoreDefaults() {
    if (restoring) return;

    setRestoring(true);
    setMessage("");

    try {
      const next = await restoreDefaultCloudTasks();
      setTasks(next);
      setMessage("Стандартные задания возвращены.");
    } catch (error) {
      console.error("settings restoreDefaults", error);
      setMessage("Не получилось вернуть стандартные задания. Попробуй обновить страницу.");
    } finally {
      setRestoring(false);
    }
  }

  async function reset() {
    const ok = window.confirm("Сбросить демо? Это удалит отметки дней, цели, достижения и вернёт стандартные задания.");
    if (!ok) return;
    await resetVictoryLifeData();
    await loadTasks();
    setMessage("Демо сброшено.");
  }

  return (
    <AppShell title="Настройки" subtitle="Добавляй свои действия и убирай лишнее, чтобы ежедневный список был только под тебя.">
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
            <button onClick={addTask} disabled={adding || !title.trim()} className="w-full rounded-2xl bg-black px-5 py-4 font-bold text-white transition active:scale-[.98] disabled:opacity-50">
              {adding ? "Добавляю..." : "Добавить задание"}
            </button>
          </div>
        </motion.section>

        <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 }} className="apple-glass min-w-0 rounded-[30px] p-4 sm:rounded-[36px] sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <p className="text-sm text-neutral-500">Твои задания</p>
              <h2 className="text-2xl font-black tracking-tight">{loading ? "Загружаю..." : `${visibleTasks.length} из ${tasks.length}`}</h2>
            </div>
            <div className="grid grid-cols-1 gap-2 sm:flex sm:flex-wrap sm:justify-end">
              <button onClick={restoreDefaults} disabled={restoring || loading} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-bold transition active:scale-[.98] disabled:opacity-60">
                <RotateCcw className="h-4 w-4" />
                {restoring ? "Возвращаю..." : "Вернуть стандартные"}
              </button>
              <button onClick={reset} disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-neutral-100 px-4 py-3 text-sm font-bold transition active:scale-[.98] disabled:opacity-60">
                <Trash2 className="h-4 w-4" />
                Сбросить демо
              </button>
            </div>
          </div>

          {message && (
            <div className="mt-4 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-neutral-700">
              {message}
            </div>
          )}

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
            {loading && (
              <div className="rounded-[24px] bg-white p-5 text-center text-sm leading-6 text-neutral-500">
                Загружаю задания...
              </div>
            )}

            {!loading && visibleTasks.length === 0 && (
              <div className="rounded-[24px] bg-white p-5 text-center text-sm leading-6 text-neutral-500">
                Заданий пока нет. Нажми «Вернуть стандартные» или добавь своё задание.
              </div>
            )}

            {!loading && visibleTasks.map((task) => (
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
