"use client";

import { motion } from "framer-motion";

type Point = { date: string; score: number };

export function LineChart({ data }: { data: Point[] }) {
  const width = 720;
  const height = 220;
  const padding = 24;
  const max = Math.max(120, ...data.map((item) => item.score));
  const min = Math.min(0, ...data.map((item) => item.score));
  const range = max - min || 1;

  const coords = data.map((item, index) => {
    const x = padding + (index / Math.max(1, data.length - 1)) * (width - padding * 2);
    const y = height - padding - ((item.score - min) / range) * (height - padding * 2);
    return { ...item, x, y };
  });

  const path = coords.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const area = `${path} L${width - padding},${height - padding} L${padding},${height - padding} Z`;

  return (
    <div className="apple-glass overflow-hidden rounded-[32px] p-5">
      <div className="mb-4 flex items-end justify-between">
        <div>
          <p className="text-sm text-neutral-500">Динамика эффективности</p>
          <h3 className="text-2xl font-black tracking-tight">Баллы по дням</h3>
        </div>
        <span className="rounded-full bg-black px-3 py-1 text-xs font-semibold text-white">анимация</span>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className="h-[220px] w-full">
        <defs>
          <linearGradient id="lineArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0A84FF" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#0A84FF" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0, 1, 2, 3].map((i) => (
          <line key={i} x1={padding} x2={width - padding} y1={padding + i * 48} y2={padding + i * 48} stroke="rgba(11,11,15,.08)" />
        ))}
        <motion.path d={area} fill="url(#lineArea)" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: .9 }} />
        <motion.path
          d={path}
          fill="none"
          stroke="#0A84FF"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
        />
        {coords.map((p, i) => (
          <motion.g key={i} initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: .4 + i * .035 }}>
            <circle cx={p.x} cy={p.y} r="6" fill="white" stroke="#0A84FF" strokeWidth="4" />
            <text x={p.x} y={height - 4} textAnchor="middle" fontSize="12" fill="rgba(11,11,15,.48)">{p.date}</text>
          </motion.g>
        ))}
      </svg>
    </div>
  );
}
