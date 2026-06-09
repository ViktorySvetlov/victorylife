"use client";

import clsx from "clsx";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { achievements } from "@/lib/defaults";
import { getCloudLogs, getCloudTasks, syncCloudAchievements } from "@/lib/cloudStore";
import { getUnlockedAchievements } from "@/lib/points";
import { Achievement, DayLog, Task } from "@/lib/types";

export default function AchievementsPage() {
  const [unlocked, setUnlocked] = useState<Achievement[]>([]);

  useEffect(() => {
    async function loadData() {
      const [tasks, logs] = await Promise.all([getCloudTasks(), getCloudLogs()]);
      const openAchievements = getUnlockedAchievements(logs, tasks);
      setUnlocked(openAchievements);
      await syncCloudAchievements(openAchievements);
    }

    loadData();
  }, []);

  const unlockedCodes = new Set(unlocked.map((item) => item.code));

  return (
    <AppShell title="Достижения" subtitle="История побед, медали, редкость и прогресс.">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {achievements.map((item, index) => {
          const isOpen = unlockedCodes.has(item.code);
          return (
            <motion.div
              key={item.code}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * .04 }}
              className={clsx("rounded-[32px] p-5 transition", isOpen ? "dark-card" : "apple-glass opacity-60")}
            >
              <div className="text-5xl">{item.icon}</div>
              <div className="mt-5 flex items-center justify-between gap-3">
                <h2 className="text-xl font-black tracking-tight">{item.title}</h2>
                <span className={clsx("rounded-full px-3 py-1 text-[11px] font-bold uppercase", isOpen ? "bg-[#0A84FF] text-white" : "bg-neutral-200 text-neutral-500")}>{item.rarity}</span>
              </div>
              <p className={clsx("mt-2 text-sm leading-6", isOpen ? "text-white/60" : "text-neutral-500")}>{item.description}</p>
              <p className={clsx("mt-5 text-sm font-bold", isOpen ? "text-[#62B5FF]" : "text-neutral-400")}>{isOpen ? "Открыто" : "Пока закрыто"}</p>
            </motion.div>
          );
        })}
      </div>
    </AppShell>
  );
}
