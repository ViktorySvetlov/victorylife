"use client";

import { motion } from "framer-motion";

export function MetricCard({ label, value, hint, dark = false }: { label: string; value: string | number; hint?: string; dark?: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      className={dark ? "dark-card rounded-[32px] p-5" : "apple-glass rounded-[32px] p-5"}
    >
      <p className={dark ? "text-sm text-white/60" : "text-sm text-neutral-500"}>{label}</p>
      <p className="mt-2 text-4xl font-black tracking-[-0.06em]">{value}</p>
      {hint && <p className={dark ? "mt-2 text-sm text-white/60" : "mt-2 text-sm text-neutral-500"}>{hint}</p>}
    </motion.div>
  );
}
