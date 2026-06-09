import Image from "next/image";
import Link from "next/link";
import { AuthButton } from "@/components/AuthButton";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-10">
      <div className="w-full max-w-md rounded-[42px] bg-white p-7 shadow-soft">
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-[32px] bg-[#F5F5F7]">
          <Image src="/logo/victorylife-logo.png" alt="VictoryLife" width={64} height={64} priority />
        </div>
        <h1 className="mt-7 text-center text-4xl font-black tracking-[-0.06em]">VictoryLife</h1>
        <p className="mx-auto mt-3 max-w-xs text-center leading-6 text-neutral-500">Войди через Google, чтобы позже хранить прогресс, цели и достижения между устройствами.</p>
        <div className="mt-7">
          <AuthButton />
        </div>
        <Link href="/dashboard" className="mt-3 block w-full rounded-3xl bg-neutral-100 px-6 py-4 text-center font-bold text-neutral-700">Открыть демо без входа</Link>
        <p className="mt-5 text-center text-xs text-neutral-400">Для Google-входа заполни Supabase env и настрой Google OAuth.</p>
      </div>
    </main>
  );
}
