"use client";

import { defaultGoals, defaultTasks } from "./defaults";
import { scoreDay } from "./points";
import { getGoals, getLogs, getTasks, resetDemoData, saveGoals, saveTasks, upsertLog } from "./store";
import { createClient } from "./supabase/client";
import { Achievement, CategoryKey, DayLog, Goal, Task, TaskStatus } from "./types";

type TaskRow = {
  id: string;
  category_key: CategoryKey;
  title: string;
  points_positive: number;
  points_negative: number;
  is_default?: boolean;
  is_active?: boolean;
};

type LogRow = {
  date: string;
  comment: string | null;
  mood: number | null;
  created_at: string | null;
};

type CompletionRow = {
  task_id: string;
  date: string;
  status: TaskStatus;
};

type GoalRow = {
  id: string;
  type: Goal["type"];
  title: string;
  target_value: number;
  current_value: number;
  unit: Goal["unit"];
  deadline: string | null;
};

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const CLOUD_TIMEOUT_MS = 8000;

function isUuid(value: string) {
  return UUID_RE.test(value);
}

function uniqueTasks(tasks: Task[]) {
  const seen = new Set<string>();
  return tasks.filter((task) => {
    const key = `${task.category}:${task.title}`.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function localTasksWithDefaults() {
  const local = getTasks();
  return local.length ? local : defaultTasks;
}

function localRestoreDefaults() {
  const current = getTasks();
  const existing = new Set(current.map((task) => `${task.category}:${task.title}`.toLowerCase()));
  const missing = defaultTasks.filter((task) => !existing.has(`${task.category}:${task.title}`.toLowerCase()));
  const next = uniqueTasks([...current, ...missing]);
  saveTasks(next);
  return next;
}

async function withTimeout<T>(promise: Promise<T>, label = "request", ms = CLOUD_TIMEOUT_MS): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(`${label} timeout`)), ms);
  });

  try {
    return await Promise.race([promise, timeout]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

function getSupabaseSafe() {
  try {
    return createClient();
  } catch (error) {
    console.error("supabase client", error);
    return null;
  }
}

async function getUserId() {
  try {
    const supabase = getSupabaseSafe();
    if (!supabase) return null;
    const { data } = await withTimeout(supabase.auth.getUser(), "auth.getUser");
    return data.user?.id ?? null;
  } catch (error) {
    console.error("getUserId", error);
    return null;
  }
}

function mapTask(row: TaskRow): Task {
  return {
    id: row.id,
    category: row.category_key,
    title: row.title,
    points: Number(row.points_positive || 0),
    penalty: Number(row.points_negative || 0),
    custom: !row.is_default,
  };
}

function mapGoal(row: GoalRow): Goal {
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    target: Number(row.target_value),
    current: Number(row.current_value || 0),
    unit: row.unit || "points",
    deadline: row.deadline || undefined,
  };
}

async function seedDefaultTasks(userId: string) {
  const supabase = getSupabaseSafe();
  if (!supabase) return false;

  const payload = defaultTasks.map((task) => ({
    user_id: userId,
    category_key: task.category,
    title: task.title,
    points_positive: task.points,
    points_negative: task.penalty,
    is_default: true,
    is_active: true,
  }));

  try {
    const { error } = await withTimeout(supabase.from("tasks").insert(payload), "seedDefaultTasks");
    if (error) {
      // Если в старой таблице ещё нет is_active, ниже сработает fallback через restoreDefaultCloudTasks.
      console.error("seedDefaultTasks", error.message);
      return false;
    }
    return true;
  } catch (error) {
    console.error("seedDefaultTasks", error);
    return false;
  }
}

async function seedDefaultGoals(userId: string) {
  const supabase = getSupabaseSafe();
  if (!supabase) return;

  const payload = defaultGoals.map((goal) => ({
    user_id: userId,
    type: goal.type,
    title: goal.title,
    target_value: goal.target,
    current_value: goal.current || 0,
    unit: goal.unit,
    deadline: goal.deadline || null,
    is_auto_generated: goal.type === "daily",
  }));

  try {
    const { error } = await withTimeout(supabase.from("goals").insert(payload), "seedDefaultGoals");
    if (error) console.error("seedDefaultGoals", error.message);
  } catch (error) {
    console.error("seedDefaultGoals", error);
  }
}

async function selectActiveCloudTasks(userId: string): Promise<Task[] | null> {
  const supabase = getSupabaseSafe();
  if (!supabase) return null;

  const { data, error } = await withTimeout(
    supabase
      .from("tasks")
      .select("id, category_key, title, points_positive, points_negative, is_default, is_active, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: true }),
    "select tasks",
  );

  if (error) {
    console.error("selectActiveCloudTasks", error.message);
    return null;
  }

  const rows = (data || []) as TaskRow[];
  const activeRows = rows.filter((row) => row.is_active !== false);
  return uniqueTasks(activeRows.map(mapTask));
}

export async function getCloudTasks(): Promise<Task[]> {
  const userId = await getUserId();
  if (!userId) return localTasksWithDefaults();

  try {
    const selected = await selectActiveCloudTasks(userId);

    if (selected === null) return localTasksWithDefaults();
    if (selected.length > 0) return selected;

    // Если у пользователя нет активных задач, создаём базовый набор.
    // Это решает проблему пустого списка после первой Google-авторизации.
    await restoreDefaultCloudTasks();
    const afterRestore = await selectActiveCloudTasks(userId);
    return afterRestore && afterRestore.length ? afterRestore : defaultTasks;
  } catch (error) {
    console.error("getCloudTasks", error);
    return localTasksWithDefaults();
  }
}

export async function addCloudTask(input: Omit<Task, "id" | "custom">): Promise<Task[]> {
  const fallbackTask: Task = { ...input, id: crypto.randomUUID(), custom: true };
  const fallbackNext = uniqueTasks([...localTasksWithDefaults(), fallbackTask]);

  const userId = await getUserId();
  if (!userId) {
    saveTasks(fallbackNext);
    return fallbackNext;
  }

  const supabase = getSupabaseSafe();
  if (!supabase) {
    saveTasks(fallbackNext);
    return fallbackNext;
  }

  try {
    const { error } = await withTimeout(
      supabase.from("tasks").insert({
        user_id: userId,
        category_key: input.category,
        title: input.title,
        points_positive: input.points,
        points_negative: input.penalty,
        is_default: false,
        is_active: true,
      }),
      "addCloudTask",
    );

    if (error) {
      console.error("addCloudTask", error.message);
      saveTasks(fallbackNext);
      return fallbackNext;
    }

    return getCloudTasks();
  } catch (error) {
    console.error("addCloudTask", error);
    saveTasks(fallbackNext);
    return fallbackNext;
  }
}

export async function removeCloudTask(taskId: string): Promise<Task[]> {
  const userId = await getUserId();

  if (!userId || !isUuid(taskId)) {
    const next = localTasksWithDefaults().filter((task) => task.id !== taskId);
    saveTasks(next);
    return next;
  }

  const supabase = getSupabaseSafe();
  if (!supabase) return localTasksWithDefaults().filter((task) => task.id !== taskId);

  try {
    // Основной способ: мягко скрываем задачу.
    const { error } = await withTimeout(
      supabase
        .from("tasks")
        .update({ is_active: false })
        .eq("id", taskId)
        .eq("user_id", userId),
      "removeCloudTask update",
    );

    if (error) {
      console.error("removeCloudTask update", error.message);

      // Fallback для старой схемы БД без is_active: жёсткое удаление.
      const { error: deleteError } = await withTimeout(
        supabase.from("tasks").delete().eq("id", taskId).eq("user_id", userId),
        "removeCloudTask delete",
      );
      if (deleteError) console.error("removeCloudTask delete", deleteError.message);
    }

    return getCloudTasks();
  } catch (error) {
    console.error("removeCloudTask", error);
    return localTasksWithDefaults().filter((task) => task.id !== taskId);
  }
}

export async function restoreDefaultCloudTasks(): Promise<Task[]> {
  const userId = await getUserId();

  if (!userId) return localRestoreDefaults();

  const supabase = getSupabaseSafe();
  if (!supabase) return localRestoreDefaults();

  try {
    const { data, error } = await withTimeout(
      supabase
        .from("tasks")
        .select("id, category_key, title, is_active")
        .eq("user_id", userId),
      "restoreDefaultCloudTasks select",
    );

    if (error) {
      console.error("restoreDefaultCloudTasks select", error.message);
      const ok = await seedDefaultTasks(userId);
      if (!ok) return localRestoreDefaults();
      const seeded = await selectActiveCloudTasks(userId);
      return seeded && seeded.length ? seeded : defaultTasks;
    }

    const rows = (data || []) as Pick<TaskRow, "id" | "category_key" | "title" | "is_active">[];

    for (const task of defaultTasks) {
      const sameTask = rows.find((row) => row.category_key === task.category && row.title === task.title);

      if (sameTask) {
        if (!sameTask.is_active) {
          const { error: updateError } = await withTimeout(
            supabase.from("tasks").update({ is_active: true }).eq("id", sameTask.id).eq("user_id", userId),
            "restoreDefaultCloudTasks update",
          );
          if (updateError) console.error("restoreDefaultCloudTasks update", updateError.message);
        }
        continue;
      }

      const { error: insertError } = await withTimeout(
        supabase.from("tasks").insert({
          user_id: userId,
          category_key: task.category,
          title: task.title,
          points_positive: task.points,
          points_negative: task.penalty,
          is_default: true,
          is_active: true,
        }),
        "restoreDefaultCloudTasks insert",
      );

      if (insertError) console.error("restoreDefaultCloudTasks insert", insertError.message);
    }

    const next = await selectActiveCloudTasks(userId);
    return next && next.length ? next : defaultTasks;
  } catch (error) {
    console.error("restoreDefaultCloudTasks", error);
    return localRestoreDefaults();
  }
}

export async function getCloudLogs(): Promise<DayLog[]> {
  const userId = await getUserId();
  if (!userId) return getLogs();

  const supabase = getSupabaseSafe();
  if (!supabase) return getLogs();

  try {
    const [{ data: logs, error: logsError }, { data: completions, error: completionsError }] = await Promise.all([
      withTimeout(supabase.from("daily_logs").select("date, comment, mood, created_at").order("date", { ascending: true }), "getCloudLogs logs"),
      withTimeout(supabase.from("task_completions").select("task_id, date, status").order("date", { ascending: true }), "getCloudLogs completions"),
    ]);

    if (logsError || completionsError) {
      console.error("getCloudLogs", logsError?.message || completionsError?.message);
      return getLogs();
    }

    const completionsByDate = new Map<string, Record<string, TaskStatus>>();
    (completions as CompletionRow[] | null || []).forEach((item) => {
      const statuses = completionsByDate.get(item.date) || {};
      statuses[item.task_id] = item.status;
      completionsByDate.set(item.date, statuses);
    });

    return (logs as LogRow[] | null || []).map((log) => ({
      date: log.date,
      statuses: completionsByDate.get(log.date) || {},
      comment: log.comment || "",
      mood: log.mood || undefined,
      createdAt: log.created_at || new Date().toISOString(),
    }));
  } catch (error) {
    console.error("getCloudLogs", error);
    return getLogs();
  }
}

export async function upsertCloudLog(log: DayLog, tasks: Task[]): Promise<DayLog[]> {
  const userId = await getUserId();
  if (!userId) return upsertLog(log);

  const supabase = getSupabaseSafe();
  if (!supabase) return upsertLog(log);

  const total = scoreDay(log, tasks);

  try {
    const { error: logError } = await withTimeout(
      supabase.from("daily_logs").upsert({
        user_id: userId,
        date: log.date,
        total_score: total,
        comment: log.comment || null,
        mood: log.mood || null,
      }, { onConflict: "user_id,date" }),
      "upsertCloudLog daily_logs",
    );

    if (logError) {
      console.error("upsertCloudLog daily_logs", logError.message);
      return getCloudLogs();
    }

    await withTimeout(
      supabase.from("task_completions").delete().eq("user_id", userId).eq("date", log.date),
      "upsertCloudLog delete completions",
    );

    const rows = Object.entries(log.statuses)
      .filter(([taskId, status]) => isUuid(taskId) && status !== "skip")
      .map(([taskId, status]) => {
        const task = tasks.find((item) => item.id === taskId);
        return {
          user_id: userId,
          task_id: taskId,
          date: log.date,
          status,
          earned_points: status === "done" ? (task?.points || 0) : status === "missed" ? (task?.penalty || 0) : 0,
        };
      });

    if (rows.length) {
      const { error } = await withTimeout(supabase.from("task_completions").insert(rows), "upsertCloudLog task_completions");
      if (error) console.error("upsertCloudLog task_completions", error.message);
    }

    return getCloudLogs();
  } catch (error) {
    console.error("upsertCloudLog", error);
    return getCloudLogs();
  }
}

export async function getCloudGoals(): Promise<Goal[]> {
  const userId = await getUserId();
  if (!userId) return getGoals();

  const supabase = getSupabaseSafe();
  if (!supabase) return getGoals();

  try {
    const { data, error } = await withTimeout(
      supabase
        .from("goals")
        .select("id, type, title, target_value, current_value, unit, deadline")
        .order("created_at", { ascending: true }),
      "getCloudGoals",
    );

    if (error) {
      console.error("getCloudGoals", error.message);
      return getGoals();
    }

    if (!data || data.length === 0) {
      await seedDefaultGoals(userId);
      return getCloudGoals();
    }

    return (data as GoalRow[]).map(mapGoal);
  } catch (error) {
    console.error("getCloudGoals", error);
    return getGoals();
  }
}

export async function saveCloudGoals(goals: Goal[]): Promise<Goal[]> {
  const userId = await getUserId();
  if (!userId) {
    saveGoals(goals);
    return goals;
  }

  const supabase = getSupabaseSafe();
  if (!supabase) {
    saveGoals(goals);
    return goals;
  }

  try {
    for (const goal of goals) {
      const row = {
        user_id: userId,
        type: goal.type,
        title: goal.title,
        target_value: goal.target,
        current_value: goal.current || 0,
        unit: goal.unit,
        deadline: goal.deadline || null,
        is_auto_generated: goal.type === "daily",
      };

      if (isUuid(goal.id)) {
        const { error } = await withTimeout(supabase.from("goals").update(row).eq("id", goal.id).eq("user_id", userId), "saveCloudGoals update");
        if (error) console.error("saveCloudGoals update", error.message);
      } else {
        const { error } = await withTimeout(supabase.from("goals").insert(row), "saveCloudGoals insert");
        if (error) console.error("saveCloudGoals insert", error.message);
      }
    }

    return getCloudGoals();
  } catch (error) {
    console.error("saveCloudGoals", error);
    saveGoals(goals);
    return goals;
  }
}

export async function syncCloudAchievements(unlocked: Achievement[]) {
  const userId = await getUserId();
  if (!userId || unlocked.length === 0) return;

  const supabase = getSupabaseSafe();
  if (!supabase) return;

  try {
    const { data, error } = await withTimeout(
      supabase
        .from("achievements")
        .select("id, code")
        .in("code", unlocked.map((item) => item.code)),
      "syncCloudAchievements select",
    );

    if (error || !data) {
      console.error("syncCloudAchievements select", error?.message);
      return;
    }

    const rows = data.map((item) => ({ user_id: userId, achievement_id: item.id }));
    const { error: upsertError } = await withTimeout(
      supabase.from("user_achievements").upsert(rows, { onConflict: "user_id,achievement_id" }),
      "syncCloudAchievements upsert",
    );

    if (upsertError) console.error("syncCloudAchievements upsert", upsertError.message);
  } catch (error) {
    console.error("syncCloudAchievements", error);
  }
}

export async function resetVictoryLifeData() {
  const userId = await getUserId();
  if (!userId) {
    resetDemoData();
    return;
  }

  const supabase = getSupabaseSafe();
  if (!supabase) return;

  try {
    await withTimeout(supabase.from("task_completions").delete().eq("user_id", userId), "reset task_completions");
    await withTimeout(supabase.from("daily_logs").delete().eq("user_id", userId), "reset daily_logs");
    await withTimeout(supabase.from("goals").delete().eq("user_id", userId), "reset goals");
    await withTimeout(supabase.from("user_achievements").delete().eq("user_id", userId), "reset achievements");
    await withTimeout(supabase.from("tasks").delete().eq("user_id", userId), "reset tasks");

    await seedDefaultTasks(userId);
    await seedDefaultGoals(userId);
  } catch (error) {
    console.error("resetVictoryLifeData", error);
  }
}
