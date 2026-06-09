"use client";

import { Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { getGoals, getLogs, getTasks } from "@/lib/store";
import { categoryScores, lastNDays, scoreDay, todayKey } from "@/lib/points";
import { DayLog, Goal, Task } from "@/lib/types";

export default function CoachPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [logs, setLogs] = useState<DayLog[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setTasks(getTasks());
    setLogs(getLogs());
    setGoals(getGoals());
  }, []);

  const today = logs.find((log) => log.date === todayKey());
  const week = lastNDays(logs, 7);
  const scores = categoryScores(week, tasks);
  const weekScores = week.map((log) => ({ date: log.date, score: scoreDay(log, tasks), comment: log.comment }));

  async function askCoach() {
    setLoading(true);
    setAnswer("");
    try {
      const response = await fetch("/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: question || "Сделай разбор недели и дай 3 действия на завтра",
          todayComment: today?.comment,
          weekScores,
          categoryScores: scores,
          goals,
        }),
      });
      const data = await response.json();
      setAnswer(data.answer || "Коуч пока молчит. Попробуй ещё раз.");
    } catch {
      setAnswer("Не удалось обратиться к коучу. Проверь запуск сервера и env-переменные.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell title="Твой коуч" subtitle="ИИ-разбор дня, недели, просадок и целей на основе твоих баллов и комментария дня.">
      <div className="grid gap-5 lg:grid-cols-[.9fr_1.1fr]">
        <div className="dark-card rounded-[36px] p-6">
          <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-white text-black">
            <Sparkles className="h-7 w-7" />
          </div>
          <h2 className="mt-5 text-4xl font-black tracking-[-0.06em]">Спроси, где точка роста.</h2>
          <p className="mt-4 leading-7 text-white/60">Коуч видит твои баллы, категории, цели и комментарий дня. Он не заменяет тебя, а помогает заметить закономерности.</p>
          <div className="mt-6 grid gap-3 text-sm text-white/70">
            <button onClick={() => setQuestion("Почему у меня проседает дисциплина?")} className="rounded-2xl bg-white/10 p-4 text-left font-semibold">Почему проседает дисциплина?</button>
            <button onClick={() => setQuestion("Что мне сделать завтра, чтобы выйти в плюс?")} className="rounded-2xl bg-white/10 p-4 text-left font-semibold">Что сделать завтра?</button>
            <button onClick={() => setQuestion("Как работа влияет на здоровье и жизнь?")} className="rounded-2xl bg-white/10 p-4 text-left font-semibold">Как работа влияет на жизнь?</button>
          </div>
        </div>

        <div className="apple-glass rounded-[36px] p-6">
          <p className="text-sm text-neutral-500">Запрос коучу</p>
          <textarea value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Например: проанализируй мой день и скажи, что улучшить завтра" className="mt-4 min-h-44 w-full resize-none rounded-[28px] border border-black/10 bg-white p-5 outline-none focus:border-[#0A84FF]" />
          <button onClick={askCoach} disabled={loading} className="mt-4 w-full rounded-[28px] bg-black px-6 py-5 text-lg font-black text-white shadow-soft transition disabled:opacity-50 active:scale-[.98]">
            {loading ? "Коуч думает..." : "Получить разбор"}
          </button>

          {answer && (
            <div className="mt-5 whitespace-pre-wrap rounded-[28px] bg-white p-5 leading-7 shadow-[0_10px_30px_rgba(11,11,15,.04)]">
              {answer}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
