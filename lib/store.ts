"use client";

import { defaultGoals, defaultTasks } from "./defaults";
import { DayLog, Goal, Task } from "./types";

const TASKS_KEY = "victorylife.tasks";
const LOGS_KEY = "victorylife.logs";
const GOALS_KEY = "victorylife.goals";

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) as T : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  if (typeof window !== "undefined") localStorage.setItem(key, JSON.stringify(value));
}

export function getTasks(): Task[] {
  return read<Task[]>(TASKS_KEY, defaultTasks);
}

export function saveTasks(tasks: Task[]) {
  write(TASKS_KEY, tasks);
}

export function getLogs(): DayLog[] {
  return read<DayLog[]>(LOGS_KEY, []);
}

export function saveLogs(logs: DayLog[]) {
  write(LOGS_KEY, logs);
}

export function upsertLog(log: DayLog) {
  const logs = getLogs();
  const next = logs.some((item) => item.date === log.date)
    ? logs.map((item) => item.date === log.date ? log : item)
    : [...logs, log];
  saveLogs(next.sort((a, b) => a.date.localeCompare(b.date)));
  return next;
}

export function getGoals(): Goal[] {
  return read<Goal[]>(GOALS_KEY, defaultGoals);
}

export function saveGoals(goals: Goal[]) {
  write(GOALS_KEY, goals);
}

export function resetDemoData() {
  localStorage.removeItem(TASKS_KEY);
  localStorage.removeItem(LOGS_KEY);
  localStorage.removeItem(GOALS_KEY);
}
