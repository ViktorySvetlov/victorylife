"use client";

import { motion } from "framer-motion";
import { categories } from "@/lib/defaults";
import { CategoryKey } from "@/lib/types";

export function Rings({ scores }: { scores: Record<CategoryKey, number> }) {
  const max = Math.max(80, ...Object.values(scores).map((v) => Math.max(0, v)));
  return (
    <div className="apple-glass rounded-[32px] p-5">
      <p className="text-sm text-neutral-500">Категории</p>
      <h3 className="mb-5 text-2xl font-black tracking-tight">Прогресс сфер</h3>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {categories.map((cat, index) => {
          const value = Math.max(0, scores[cat.key]);
          const pct = Math.min(100, Math.round((value / max) * 100));
          const circumference = 2 * Math.PI * 42;
          return (
            <div key={cat.key} className="rounded-[24px] bg-white p-4 text-center shadow-[0_10px_30px_rgba(11,11,15,.04)]">
              <svg viewBox="0 0 100 100" className="mx-auto h-24 w-24 -rotate-90">
                <circle cx="50" cy="50" r="42" stroke="rgba(11,11,15,.08)" strokeWidth="10" fill="none" />
                <motion.circle
                  cx="50"
                  cy="50"
                  r="42"
                  stroke="#0A84FF"
                  strokeWidth="10"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  initial={{ strokeDashoffset: circumference }}
                  animate={{ strokeDashoffset: circumference - (pct / 100) * circumference }}
                  transition={{ delay: index * .06, duration: .9 }}
                />
              </svg>
              <p className="-mt-[58px] text-xl font-black">{pct}%</p>
              <p className="mt-10 text-sm font-semibold">{cat.title}</p>
              <p className="text-xs text-neutral-500">{value} баллов</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
