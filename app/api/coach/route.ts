import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const apiKey = process.env.DEEPSEEK_API_KEY;
    const model = process.env.DEEPSEEK_MODEL || "deepseek-v4-flash";

    const fallback = `Короткий разбор VictoryLife:\n\n1. Сильная сторона: ты уже фиксируешь день, а значит управляешь им, а не просто проживаешь.\n2. Зона внимания: следи, чтобы рост в работе не забирал ресурс у здоровья и жизни.\n3. На завтра: выбери 1 ключевую рабочую задачу, 1 действие для тела и 1 действие для дисциплины.\n\nНачинай побеждать — маленькими действиями каждый день.`;

    if (!apiKey) {
      return NextResponse.json({ answer: fallback, source: "demo" });
    }

    const prompt = `Ты — "Твой коуч" в продукте VictoryLife. Твоя задача — кратко анализировать эффективность человека по баллам, задачам, целям и комментарию дня. Пиши по-русски, уверенно, без морализаторства. Формат: короткий итог, сильная сторона, зона просадки, 3 действия на завтра.\n\nДанные пользователя:\n${JSON.stringify(body, null, 2)}`;

    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: "Ты лаконичный персональный коуч по эффективности, дисциплине, деньгам, здоровью и целям." },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 900,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({ answer: fallback, source: "fallback", error: errorText }, { status: 200 });
    }

    const data = await response.json();
    const answer = data?.choices?.[0]?.message?.content || fallback;
    return NextResponse.json({ answer, source: "deepseek" });
  } catch (error) {
    return NextResponse.json({ answer: "Твой коуч временно не смог обработать запрос. Попробуй ещё раз через минуту.", error: String(error) }, { status: 200 });
  }
}
