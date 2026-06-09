import Link from "next/link";
import Image from "next/image";
import { ArrowRight, BarChart3, Medal, Sparkles } from "lucide-react";

export default function HomePage() {
  return (
    <main className="min-h-screen px-5 py-8 md:px-12">
      <header className="mx-auto flex max-w-6xl items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white shadow-soft">
            <Image src="/logo/victorylife-logo.png" alt="VictoryLife" width={30} height={30} priority />
          </span>
          <div>
            <p className="font-black tracking-tight">VictoryLife</p>
            <p className="text-xs text-neutral-500">Начинай побеждать!</p>
          </div>
        </div>
        <Link href="/login" className="rounded-full bg-black px-5 py-3 text-sm font-bold text-white">Войти</Link>
      </header>

      <section className="mx-auto grid max-w-6xl items-center gap-10 py-16 md:grid-cols-[1.05fr_.95fr] md:py-24">
        <div>
          <p className="mb-4 inline-flex rounded-full bg-white px-4 py-2 text-sm font-semibold text-neutral-600 shadow-soft">Web-first MVP · Apple-style UI · Твой коуч</p>
          <h1 className="text-6xl font-black leading-[.88] tracking-[-0.075em] md:text-8xl">Прокачивай жизнь в баллах.</h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-neutral-500">Отмечай действия, видь динамику работы, здоровья, денег и дисциплины. VictoryLife превращает день в понятную систему роста.</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/dashboard" className="flex items-center justify-center gap-2 rounded-3xl bg-black px-7 py-4 font-bold text-white shadow-soft transition active:scale-[.98]">Открыть демо <ArrowRight className="h-5 w-5" /></Link>
            <Link href="/login" className="flex items-center justify-center rounded-3xl bg-white px-7 py-4 font-bold shadow-soft transition active:scale-[.98]">Регистрация</Link>
          </div>
        </div>
        <div className="dark-card relative overflow-hidden rounded-[44px] p-6 md:p-8">
          <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-[#0A84FF]/35 blur-3xl" />
          <div className="relative">
            <p className="text-sm text-white/50">Сегодня</p>
            <p className="mt-2 text-7xl font-black tracking-[-0.08em]">+118</p>
            <p className="text-white/60">цель дня закрыта</p>
            <div className="mt-8 grid gap-3">
              {[
                [BarChart3, "Анимированная аналитика"],
                [Medal, "Достижения и серия побед"],
                [Sparkles, "Твой коуч на базе DeepSeek"],
              ].map(([Icon, text]) => {
                const I = Icon as typeof BarChart3;
                return <div key={String(text)} className="flex items-center gap-3 rounded-3xl bg-white/10 p-4"><I className="h-5 w-5 text-[#62B5FF]" /><span className="font-semibold">{String(text)}</span></div>;
              })}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
