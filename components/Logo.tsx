import Image from "next/image";
import Link from "next/link";

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/dashboard" className="flex items-center gap-3">
      <span className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-white shadow-soft">
        <Image src="/logo/victorylife-logo.png" alt="VictoryLife" width={28} height={28} priority />
      </span>
      {!compact && (
        <span className="leading-tight">
          <span className="block text-[17px] font-bold tracking-tight">VictoryLife</span>
          <span className="block text-xs text-neutral-500">Начинай побеждать!</span>
        </span>
      )}
    </Link>
  );
}
