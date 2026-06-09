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

function isUuid(value: string) {
  return UUID_RE.test(value);
}

async function getUserId() {
  try {
    const supabase = createClient();
    const { data } = await supabase.auth.getUser();
    return data.user?.id ?? null;
  } catch {
    return null;
  }
}

function mapTask(row: TaskRow): Task {
  return {
    id: row.id,
    category: row.category_key,
    title: row.title,
    points: row.points_positive,
    penalty: row.points_negative,
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
  const supabase = createClient();
  const payload = defaultTasks.map((task) => ({
    user_id: userId,
    category_key: task.category,
    title: task.title,
    points_positive: task.points,
    points_negative: task.penalty,
    is_default: false,
    is_active: true,
  }));

  await supabase.from("tasks").insert(payload);
}

async function seedDefaultGoals(userId: string) {
  const supabase = createClient();
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

  await supabase.from("goals").insert(payload);
}

export async function getCloudTasks(): Promise<Task[]> {
  const userId = await getUserId();
  if (!userId) return getTasks();

  const supabase = createClient();
  const { data, error } = await supabase
    .from("tasks")
    .select("id, category_key, title, points_positive, points_negative, is_default, is_active")
    .eq("is_active", true)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("getCloudTasks", error.message);
    return getTasks();
  }

  if (!data || data.length === 0) {
    await seedDefaultTasks(userId);
    return getCloudTasks();
  }

  return (data as TaskRow[]).map(mapTask);
}

export async function addCloudTask(input: Omit<Task, "id" | "custom">): Promise<Task[]> {
  const userId = await getUserId();
  if (!userId) {
    const next: Task[] = [...getTasks(), { ...input, id: crypto.randomUUID(), custom: true }];
    saveTasks(next);
    return next;
  }

  const supabase = createClient();
  const { error } = await supabase.from("tasks").insert({
    user_id: userId,
    category_key: input.category,
    title: input.title,
    points_positive: input.points,
    points_negative: input.penalty,
    is_default: false,
    is_active: true,
  });

  if (error) console.error("addCloudTask", error.message);
  return getCloudTasks();
}

export async function removeCloudTask(taskId: string): Promise<Task[]> {
  const userId = await getUserId();

  // Без входа через Google работаем с localStorage: задача просто исчезает из списка.
  if (!userId || !isUuid(taskId)) {
    const next = getTasks().filter((task) => task.id !== taskId);
    saveTasks(next);
    return next;
  }

  const supabase = createClient();

  // В Supabase не удаляем строку жёстко, а скрываем её через is_active=false.
  // Так безопаснее: история и старые отметки не ломаются из-за удаления задания.
  const { error } = await supabase
    .from("tasks")
    .update({ is_active: false })
    .eq("id", taskId)
    .eq("user_id", userId);

  if (error) console.error("removeCloudTask", error.message);
  return getCloudTasks();
}

export async function restoreDefaultCloudTasks(): Promise<Task[]> {
  const userId = await getUserId();

  if (!userId) {
    const current = getTasks();
    const existingIds = new Set(current.map((task) => task.id));
    const missing = defaultTasks.filter((task) => !existingIds.has(task.id));
    const next = [...current, ...missing];
    saveTasks(next);
    return next;
  }

  const supabase = createClient();

  const { data, error } = await supabase
    .from("tasks")
    .select("id, category_key, title, is_active")
    .eq("user_id", userId);

  if (error) {
    console.error("restoreDefaultCloudTasks select", error.message);
    return getCloudTasks();
  }

  const rows = (data || []) as Pick<TaskRow, "id" | "category_key" | "title" | "is_active">[];

  for (const task of defaultTasks) {
    const sameTask = rows.find((row) => row.category_key === task.category && row.title === task.title);

    if (sameTask) {
      if (!sameTask.is_active) {
        const { error: updateError } = await supabase
          .from("tasks")
          .update({ is_active: true })
          .eq("id", sameTask.id)
          .eq("user_id", userId);
        if (updateError) console.error("restoreDefaultCloudTasks update", updateError.message);
      }
      continue;
    }

    const { error: insertError } = await supabase.from("tasks").insert({
      user_id: userId,
      category_key: task.category,
      title: task.title,
      points_positive: task.points,
      points_negative: task.penalty,
      is_default: false,
      is_active: true,
    });

    if (insertError) console.error("restoreDefaultCloudTasks insert", insertError.message);
  }

  return getCloudTasks();
}

export async function getCloudLogs(): Promise<DayLog[]> {
  const userId = await getUserId();
  if (!userId) return getLogs();

  const supabase = createClient();
  const [{ data: logs, error: logsError }, { data: completions, error: completionsError }] = await Promise.all([
    supabase.from("daily_logs").select("date, comment, mood, created_at").order("date", { ascending: true }),
    supabase.from("task_completions").select("task_id, date, status").order("date", { ascending: true }),
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
}

export async function upsertCloudLog(log: DayLog, tasks: Task[]): Promise<DayLog[]> {
  const userId = await getUserId();
  if (!userId) return upsertLog(log);

  const supabase = createClient();
  const total = scoreDay(log, tasks);

  const { error: logError } = await supabase.from("daily_logs").upsert({
    user_id: userId,
    date: log.date,
    total_score: total,
    comment: log.comment || null,
    mood: log.mood || null,
  }, { onConflict: "user_id,date" });

  if (logError) {
    console.error("upsertCloudLog daily_logs", logError.message);
    return getCloudLogs();
  }

  await supabase
    .from("task_completions")
    .delete()
    .eq("user_id", userId)
    .eq("date", log.date);

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
    const { error } = await supabase.from("task_completions").insert(rows);
    if (error) console.error("upsertCloudLog task_completions", error.message);
  }

  return getCloudLogs();
}

export async function getCloudGoals(): Promise<Goal[]> {
  const userId = await getUserId();
  if (!userId) return getGoals();

  const supabase = createClient();
  const { data, error } = await supabase
    .from("goals")
    .select("id, type, title, target_value, current_value, unit, deadline")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("getCloudGoals", error.message);
    return getGoals();
  }

  if (!data || data.length === 0) {
    await seedDefaultGoals(userId);
    return getCloudGoals();
  }

  return (data as GoalRow[]).map(mapGoal);
}

export async function saveCloudGoals(goals: Goal[]): Promise<Goal[]> {
  const userId = await getUserId();
  if (!userId) {
    saveGoals(goals);
    return goals;
  }

  const supabase = createClient();

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
      const { error } = await supabase.from("goals").update(row).eq("id", goal.id).eq("user_id", userId);
      if (error) console.error("saveCloudGoals update", error.message);
    } else {
      const { error } = await supabase.from("goals").insert(row);
      if (error) console.error("saveCloudGoals insert", error.message);
    }
  }

  return getCloudGoals();
}

export async function syncCloudAchievements(unlocked: Achievement[]) {
  const userId = await getUserId();
  if (!userId || unlocked.length === 0) return;

  const supabase = createClient();
  const { data, error } = await supabase
    .from("achievements")
    .select("id, code")
    .in("code", unlocked.map((item) => item.code));

  if (error || !data) {
    console.error("syncCloudAchievements select", error?.message);
    return;
  }

  const rows = data.map((item) => ({ user_id: userId, achievement_id: item.id }));
  const { error: upsertError } = await supabase
    .from("user_achievements")
    .upsert(rows, { onConflict: "user_id,achievement_id" });

  if (upsertError) console.error("syncCloudAchievements upsert", upsertError.message);
}

export async function resetVictoryLifeData() {
  const userId = await getUserId();
  if (!userId) {
    resetDemoData();
    return;
  }

  const supabase = createClient();
  await supabase.from("task_completions").delete().eq("user_id", userId);
  await supabase.from("daily_logs").delete().eq("user_id", userId);
  await supabase.from("goals").delete().eq("user_id", userId);
  await supabase.from("user_achievements").delete().eq("user_id", userId);
  await supabase.from("tasks").delete().eq("user_id", userId);

  await seedDefaultTasks(userId);
  await seedDefaultGoals(userId);
}
