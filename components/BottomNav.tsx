"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, CalendarCheck, Goal, Home, Medal, Settings, Sparkles } from "lucide-react";
import clsx from "clsx";

const items = [
  { href: "/dashboard", label: "Главная", icon: Home },
  { href: "/today", label: "Сегодня", icon: CalendarCheck },
  { href: "/analytics", label: "Аналитика", icon: BarChart3 },
  { href: "/goals", label: "Цели", icon: Goal },
  { href: "/achievements", label: "Достижения", icon: Medal },
  { href: "/coach", label: "Коуч", icon: Sparkles },
  { href: "/settings", label: "Настройки", icon: Settings },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <>
      <nav className="fixed bottom-3 left-3 right-3 z-40 rounded-[28px] border border-black/10 bg-white/85 p-2 shadow-soft backdrop-blur-2xl md:hidden">
        <div className="grid grid-cols-5 gap-1">
          {items.slice(0, 5).map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link key={item.href} href={item.href} className={clsx("flex flex-col items-center gap-1 rounded-2xl px-2 py-2 text-[11px] transition", active ? "bg-black text-white" : "text-neutral-500") }>
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>

      <aside className="fixed bottom-0 left-0 top-0 z-40 hidden w-[92px] flex-col items-center gap-5 border-r border-black/10 bg-white/70 px-4 py-7 backdrop-blur-2xl md:flex">
        {items.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link key={item.href} href={item.href} title={item.label} className={clsx("flex h-12 w-12 items-center justify-center rounded-2xl transition", active ? "bg-black text-white shadow-blue" : "text-neutral-500 hover:bg-white hover:text-black") }>
              <Icon className="h-5 w-5" />
            </Link>
          );
        })}
      </aside>
    </>
  );
}
