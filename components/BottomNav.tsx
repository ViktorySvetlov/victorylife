"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, CalendarCheck, Goal, Home, Medal, Settings, Sparkles } from "lucide-react";
import clsx from "clsx";

const items = [
  { href: "/dashboard", label: "Главная", shortLabel: "Главная", icon: Home },
  { href: "/today", label: "Сегодня", shortLabel: "Сегодня", icon: CalendarCheck },
  { href: "/analytics", label: "Аналитика", shortLabel: "Графики", icon: BarChart3 },
  { href: "/goals", label: "Цели", shortLabel: "Цели", icon: Goal },
  { href: "/achievements", label: "Достижения", shortLabel: "Награды", icon: Medal },
  { href: "/coach", label: "Коуч", shortLabel: "Коуч", icon: Sparkles },
  { href: "/settings", label: "Настройки", shortLabel: "Настр.", icon: Settings },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <>
      <nav className="fixed bottom-3 left-3 right-3 z-40 md:hidden">
        <div className="no-scrollbar overflow-x-auto rounded-[28px] border border-black/10 bg-white/90 p-2 shadow-soft backdrop-blur-2xl">
          <div className="flex min-w-max gap-1">
            {items.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-label={item.label}
                  className={clsx(
                    "flex w-[64px] flex-col items-center gap-1 rounded-2xl px-2 py-2 text-[10px] font-bold transition active:scale-[.96]",
                    active ? "bg-black text-white" : "text-neutral-500 hover:bg-neutral-100 hover:text-black"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="leading-none">{item.shortLabel}</span>
                </Link>
              );
            })}
          </div>
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
