"use client";

import clsx from "clsx";
import { DayLog, Task } from "@/lib/types";
import { scoreDay } from "@/lib/points";

export function Heatmap({ logs, tasks }: { logs: DayLog[]; tasks: Task[] }) {
  const cells = Array.from({ length: 42 }).map((_, idx) => {
    const date = new Date();
    date.setDate(date.getDate() - (41 - idx));
    const key = date.toISOString().slice(0, 10);
    const log = logs.find((item) => item.date === key);
    const score = scoreDay(log, tasks);
    return { key, score };
  });

  return (
    <div className="apple-glass rounded-[32px] p-5">
      <p className="text-sm text-neutral-500">История</p>
      <h3 className="mb-5 text-2xl font-black tracking-tight">Карта побед</h3>
      <div className="grid grid-cols-7 gap-2">
        {cells.map((cell) => (
          <div
            key={cell.key}
            title={`${cell.key}: ${cell.score} баллов`}
            className={clsx(
              "aspect-square rounded-xl transition hover:scale-110",
              cell.score >= 100 && "bg-[#0A84FF]",
              cell.score >= 50 && cell.score < 100 && "bg-[#62B5FF]",
              cell.score > 0 && cell.score < 50 && "bg-[#CDE7FF]",
              cell.score === 0 && "bg-neutral-200",
              cell.score < 0 && "bg-neutral-900"
            )}
          />
        ))}
      </div>
      <div className="mt-4 flex items-center justify-between text-xs text-neutral-500">
        <span>слабее</span>
        <span>сильнее</span>
      </div>
    </div>
  );
}
