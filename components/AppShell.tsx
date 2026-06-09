import { BottomNav } from "./BottomNav";
import { Logo } from "./Logo";

export function AppShell({ children, title, subtitle }: { children: React.ReactNode; title: string; subtitle?: string }) {
  return (
    <>
      <BottomNav />
      <main className="mobile-shell">
        <header className="mb-7 flex items-center justify-between gap-4">
          <Logo />
          <div className="hidden text-right md:block">
            <p className="text-sm text-neutral-500">VictoryLife</p>
            <p className="font-semibold">Начинай побеждать!</p>
          </div>
        </header>
        <section className="mb-7">
          <h1 className="text-4xl font-black tracking-[-0.05em] md:text-6xl">{title}</h1>
          {subtitle && <p className="mt-3 max-w-2xl text-base leading-7 text-neutral-500 md:text-lg">{subtitle}</p>}
        </section>
        {children}
      </main>
    </>
  );
}
