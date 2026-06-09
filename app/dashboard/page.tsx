"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { MetricCard } from "@/components/MetricCard";
import { WisdomCard } from "@/components/WisdomCard";
import { LineChart } from "@/components/charts/LineChart";
import { Rings } from "@/components/charts/Rings";
import { getCloudGoals, getCloudLogs, getCloudTasks } from "@/lib/cloudStore";
import { categoryScores, lastNDays, recommendedDailyGoal, scoreDay, seriesByDay, todayKey, totalScore, demoLogs } from "@/lib/points";
import { DayLog, Goal, Task } from "@/lib/types";

export default function DashboardPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [logs, setLogs] = useState<DayLog[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);

  useEffect(() => {
    async function loadData() {
      const [t, storedLogs, g] = await Promise.all([getCloudTasks(), getCloudLogs(), getCloudGoals()]);
      setTasks(t);
      setLogs(storedLogs.length ? storedLogs : demoLogs());
      setGoals(g);
    }

    loadData();
  }, []);

  const today = logs.find((log) => log.date === todayKey());
  const todayScore = scoreDay(today, tasks);
  const weekLogs = lastNDays(logs, 7);
  const weekScore = weekLogs.reduce((sum, log) => sum + scoreDay(log, tasks), 0);
  const monthScore = lastNDays(logs, 30).reduce((sum, log) => sum + scoreDay(log, tasks), 0);
  const goal = goals.find((item) => item.type === "daily")?.target || recommendedDailyGoal(logs, tasks);
  const status = todayScore >= goal ? "Цель дня закрыта" : todayScore > 0 ? "День в движении" : "Начни с малого";
  const scores = categoryScores(weekLogs, tasks);
  const series = seriesByDay(logs, tasks, 14);

  return (
    <AppShell title="Панель жизни" subtitle="Баллы, цели, мудрость дня и быстрый доступ к аналитике.">
      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard label="Сегодня" value={`+${todayScore}`} hint={status} dark />
        <MetricCard label="Неделя" value={weekScore} hint="сумма за 7 дней" />
        <MetricCard label="Месяц" value={monthScore} hint="сумма за 30 дней" />
        <MetricCard label="Всего" value={totalScore(logs, tasks)} hint="история побед" />
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[.9fr_1.1fr]">
        <WisdomCard />
        <div className="dark-card rounded-[32px] p-6">
          <p className="text-sm text-white/55">Быстрый вход</p>
          <h2 className="mt-2 text-3xl font-black tracking-[-0.05em]">Отметь день и запусти прогресс.</h2>
          <p className="mt-3 text-white/60">Цель дня: {goal} баллов. Если закроешь цель — получишь салют и обновление достижений.</p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link href="/today" className="rounded-3xl bg-white px-6 py-4 text-center font-bold text-black">Отметить сегодня</Link>
            <Link href="/coach" className="rounded-3xl bg-white/10 px-6 py-4 text-center font-bold text-white">Твой коуч</Link>
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1.15fr_.85fr]">
        <LineChart data={series} />
        <Rings scores={scores} />
      </div>
    </AppShell>
  );
}
