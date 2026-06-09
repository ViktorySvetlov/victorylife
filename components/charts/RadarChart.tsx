"use client";

import { motion } from "framer-motion";
import { categories } from "@/lib/defaults";
import { CategoryKey } from "@/lib/types";

export function RadarChart({ scores }: { scores: Record<CategoryKey, number> }) {
  const size = 290;
  const center = size / 2;
  const radius = 105;
  const max = Math.max(80, ...Object.values(scores).map(Math.abs));
  const points = categories.map((cat, index) => {
    const angle = (-90 + index * (360 / categories.length)) * Math.PI / 180;
    const value = Math.max(0, scores[cat.key]);
    const r = Math.min(radius, (value / max) * radius);
    return {
      x: center + Math.cos(angle) * r,
      y: center + Math.sin(angle) * r,
      lx: center + Math.cos(angle) * (radius + 22),
      ly: center + Math.sin(angle) * (radius + 22),
      label: cat.title,
    };
  });
  const polygon = points.map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <div className="apple-glass rounded-[32px] p-5">
      <p className="text-sm text-neutral-500">Баланс сфер</p>
      <h3 className="mb-4 text-2xl font-black tracking-tight">Радар жизни</h3>
      <svg viewBox={`0 0 ${size} ${size}`} className="mx-auto h-[290px] w-full max-w-[330px]">
        {[.25, .5, .75, 1].map((level) => {
          const ring = categories.map((_, index) => {
            const angle = (-90 + index * (360 / categories.length)) * Math.PI / 180;
            return `${center + Math.cos(angle) * radius * level},${center + Math.sin(angle) * radius * level}`;
          }).join(" ");
          return <polygon key={level} points={ring} fill="none" stroke="rgba(11,11,15,.09)" />;
        })}
        {categories.map((_, index) => {
          const angle = (-90 + index * (360 / categories.length)) * Math.PI / 180;
          return <line key={index} x1={center} y1={center} x2={center + Math.cos(angle) * radius} y2={center + Math.sin(angle) * radius} stroke="rgba(11,11,15,.08)" />;
        })}
        <motion.polygon
          points={polygon}
          fill="rgba(10,132,255,.20)"
          stroke="#0A84FF"
          strokeWidth="4"
          initial={{ scale: .75, opacity: 0, transformOrigin: "center" }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: .8, ease: "easeOut" }}
        />
        {points.map((p) => (
          <g key={p.label}>
            <circle cx={p.x} cy={p.y} r="5" fill="#0A84FF" />
            <text x={p.lx} y={p.ly} fontSize="11" textAnchor="middle" fill="rgba(11,11,15,.62)">{p.label}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}
