import { wisdomOfDay } from "@/lib/wisdom";

export function WisdomCard() {
  const wisdom = wisdomOfDay();
  return (
    <div className="relative overflow-hidden rounded-[32px] bg-black p-6 text-white shadow-soft">
      <div className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-[#0A84FF]/30 blur-2xl" />
      <p className="text-sm text-white/55">Мудрость дня</p>
      <blockquote className="mt-3 text-2xl font-black italic leading-tight tracking-[-0.04em]">«{wisdom.quote}»</blockquote>
      <p className="mt-4 text-sm text-white/60">— {wisdom.author}</p>
    </div>
  );
}
