import { achievements, categories, defaultTasks } from "./defaults";
import { Achievement, CategoryKey, DayLog, Goal, Task } from "./types";

export const todayKey = () => new Date().toISOString().slice(0, 10);

export function scoreDay(log: DayLog | undefined, tasks: Task[]) {
  if (!log) return 0;
  return Object.entries(log.statuses).reduce((sum, [taskId, status]) => {
    const task = tasks.find((item) => item.id === taskId);
    if (!task) return sum;
    if (status === "done") return sum + task.points;
    if (status === "missed") return sum + task.penalty;
    return sum;
  }, 0);
}

export function categoryScores(logs: DayLog[], tasks: Task[]) {
  const result: Record<CategoryKey, number> = {
    work: 0,
    discipline: 0,
    study: 0,
    life: 0,
    money: 0,
    health: 0,
  };

  logs.forEach((log) => {
    Object.entries(log.statuses).forEach(([taskId, status]) => {
      const task = tasks.find((item) => item.id === taskId);
      if (!task) return;
      result[task.category] += status === "done" ? task.points : status === "missed" ? task.penalty : 0;
    });
  });

  return result;
}

export function lastNDays(logs: DayLog[], days = 7) {
  const start = new Date();
  start.setDate(start.getDate() - (days - 1));
  const startKey = start.toISOString().slice(0, 10);
  return logs.filter((log) => log.date >= startKey).sort((a, b) => a.date.localeCompare(b.date));
}

export function seriesByDay(logs: DayLog[], tasks: Task[], days = 14) {
  const result: { date: string; score: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const key = date.toISOString().slice(0, 10);
    const log = logs.find((item) => item.date === key);
    result.push({ date: key.slice(5), score: scoreDay(log, tasks) });
  }
  return result;
}

export function getUnlockedAchievements(logs: DayLog[], tasks: Task[]): Achievement[] {
  const totalDays = logs.length;
  const bestScore = Math.max(0, ...logs.map((log) => scoreDay(log, tasks)));
  const byCategory = categoryScores(logs, tasks);
  const doneCount = (category?: CategoryKey) => logs.reduce((sum, log) => {
    return sum + Object.entries(log.statuses).filter(([taskId, status]) => {
      const task = tasks.find((item) => item.id === taskId);
      return status === "done" && (!category || task?.category === category);
    }).length;
  }, 0);

  const codes = new Set<string>();
  if (totalDays >= 1) codes.add("first-day");
  if (totalDays >= 3) codes.add("start-victory");
  if (totalDays >= 7) codes.add("week-game");
  if (totalDays >= 30) codes.add("month");
  if (bestScore >= 100) codes.add("strong-day");
  if (doneCount("discipline") >= 10) codes.add("iron-discipline");
  if (doneCount("study") >= 10) codes.add("reader");
  if (doneCount("money") >= 5) codes.add("money-pulse");
  if (doneCount("health") >= 10) codes.add("shape");
  if (Object.values(byCategory).every((value) => value > 0)) codes.add("balance");

  return achievements.filter((item) => codes.has(item.code));
}

export function recommendedDailyGoal(logs: DayLog[], tasks: Task[]) {
  const recent = lastNDays(logs, 14);
  if (recent.length < 3) return 80;
  const avg = recent.reduce((sum, log) => sum + scoreDay(log, tasks), 0) / recent.length;
  return Math.max(40, Math.round(avg * 1.15));
}

export function totalScore(logs: DayLog[], tasks: Task[]) {
  return logs.reduce((sum, log) => sum + scoreDay(log, tasks), 0);
}

export function categoryTitle(key: CategoryKey) {
  return categories.find((item) => item.key === key)?.title ?? key;
}

export function demoLogs(): DayLog[] {
  const logs: DayLog[] = [];
  const taskIds = defaultTasks.map((task) => task.id);
  for (let i = 13; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const statuses: DayLog["statuses"] = {};
    taskIds.slice(0, 26).forEach((id, index) => {
      const mod = (index + i) % 5;
      if (mod === 0 || mod === 1) statuses[id] = "done";
      else if (mod === 2) statuses[id] = "missed";
      else statuses[id] = "skip";
    });
    logs.push({
      date: date.toISOString().slice(0, 10),
      statuses,
      comment: i === 0 ? "Сегодня хочу сфокусироваться на дисциплине и работе." : "",
      createdAt: new Date().toISOString(),
    });
  }
  return logs;
}
