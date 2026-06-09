import Link from "next/link";
import { Settings } from "lucide-react";
import { BottomNav } from "./BottomNav";
import { Logo } from "./Logo";

export function AppShell({ children, title, subtitle }: { children: React.ReactNode; title: string; subtitle?: string }) {
  return (
    <>
      <BottomNav />
      <main className="mobile-shell">
        <header className="mb-7 flex items-center justify-between gap-4">
          <Logo />
          <Link
            href="/settings"
            aria-label="Открыть настройки"
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-black/10 bg-white/80 text-black shadow-[0_10px_30px_rgba(11,11,15,.06)] backdrop-blur md:hidden"
          >
            <Settings className="h-5 w-5" />
          </Link>
          <div className="hidden text-right md:block">
            <p className="text-sm text-neutral-500">VictoryLife</p>
            <p className="font-semibold">Начинай побеждать!</p>
          </div>
        </header>
        <section className="mb-7 min-w-0">
          <h1 className="text-[42px] font-black tracking-[-0.06em] leading-[.92] md:text-6xl">{title}</h1>
          {subtitle && <p className="mt-3 max-w-2xl text-base leading-7 text-neutral-500 md:text-lg">{subtitle}</p>}
        </section>
        {children}
      </main>
    </>
  );
}
