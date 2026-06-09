"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { categories } from "@/lib/defaults";
import { getTasks, resetDemoData, saveTasks } from "@/lib/store";
import { CategoryKey, Task } from "@/lib/types";

export default function SettingsPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [category, setCategory] = useState<CategoryKey>("work");
  const [title, setTitle] = useState("");
  const [points, setPoints] = useState("10");
  const [penalty, setPenalty] = useState("0");

  useEffect(() => setTasks(getTasks()), []);

  function addTask() {
    if (!title.trim()) return;
    const next: Task[] = [...tasks, {
      id: crypto.randomUUID(),
      category,
      title: title.trim(),
      points: Number(points) || 0,
      penalty: Number(penalty) || 0,
      custom: true,
    }];
    setTasks(next);
    saveTasks(next);
    setTitle("");
  }

  function removeTask(id: string) {
    const next = tasks.filter((task) => task.id !== id);
    setTasks(next);
    saveTasks(next);
  }

  function reset() {
    resetDemoData();
    location.reload();
  }

  return (
    <AppShell title="Настройки" subtitle="Добавляй свои задания, меняй баллы и готовь демо под себя.">
      <div className="grid gap-5 lg:grid-cols-[.9fr_1.1fr]">
        <div className="apple-glass rounded-[36px] p-6">
          <p className="text-sm text-neutral-500">Добавить своё задание</p>
          <div className="mt-4 grid gap-3">
            <select value={category} onChange={(e) => setCategory(e.target.value as CategoryKey)} className="rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none">
              {categories.map((item) => <option key={item.key} value={item.key}>{item.title}</option>)}
            </select>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Название задания" className="rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none focus:border-[#0A84FF]" />
            <div className="grid grid-cols-2 gap-3">
              <input value={points} onChange={(e) => setPoints(e.target.value)} placeholder="+ баллы" className="rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none focus:border-[#0A84FF]" />
              <input value={penalty} onChange={(e) => setPenalty(e.target.value)} placeholder="- баллы" className="rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none focus:border-[#0A84FF]" />
            </div>
            <button onClick={addTask} className="rounded-2xl bg-black px-5 py-4 font-bold text-white">Добавить задание</button>
          </div>
        </div>

        <div className="apple-glass rounded-[36px] p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm text-neutral-500">Все задания</p>
              <h2 className="text-2xl font-black tracking-tight">{tasks.length} заданий</h2>
            </div>
            <button onClick={reset} className="rounded-2xl bg-neutral-100 px-4 py-3 text-sm font-bold">Сбросить демо</button>
          </div>
          <div className="mt-5 max-h-[620px] space-y-2 overflow-y-auto pr-1">
            {tasks.map((task) => (
              <div key={task.id} className="flex items-center justify-between gap-3 rounded-2xl bg-white p-3">
                <div>
                  <p className="font-bold">{task.title}</p>
                  <p className="text-xs text-neutral-500">{categories.find((c) => c.key === task.category)?.title} · +{task.points} / {task.penalty}</p>
                </div>
                {task.custom && <button onClick={() => removeTask(task.id)} className="rounded-xl bg-neutral-100 px-3 py-2 text-xs font-bold">Удалить</button>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
