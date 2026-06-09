"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { LineChart } from "@/components/charts/LineChart";
import { RadarChart } from "@/components/charts/RadarChart";
import { Rings } from "@/components/charts/Rings";
import { Heatmap } from "@/components/charts/Heatmap";
import { getCloudLogs, getCloudTasks } from "@/lib/cloudStore";
import { categoryScores, demoLogs, lastNDays, seriesByDay } from "@/lib/points";
import { DayLog, Task } from "@/lib/types";

export default function AnalyticsPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [logs, setLogs] = useState<DayLog[]>([]);

  useEffect(() => {
    async function loadData() {
      const [t, stored] = await Promise.all([getCloudTasks(), getCloudLogs()]);
      setTasks(t);
      setLogs(stored.length ? stored : demoLogs());
    }

    loadData();
  }, []);

  const week = lastNDays(logs, 7);
  const scores = categoryScores(week, tasks);
  const series = seriesByDay(logs, tasks, 30);

  return (
    <AppShell title="Аналитика" subtitle="Графики эффективности, баланс сфер и карта побед.">
      <div className="grid gap-5 xl:grid-cols-[1.15fr_.85fr]">
        <LineChart data={series} />
        <RadarChart scores={scores} />
        <Rings scores={scores} />
        <Heatmap logs={logs} tasks={tasks} />
      </div>
    </AppShell>
  );
}
