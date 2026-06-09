export type CategoryKey = "work" | "discipline" | "study" | "life" | "money" | "health";

export type Category = {
  key: CategoryKey;
  title: string;
  icon: string;
  accent: string;
};

export type Task = {
  id: string;
  category: CategoryKey;
  title: string;
  points: number;
  penalty: number;
  custom?: boolean;
};

export type TaskStatus = "done" | "missed" | "skip";

export type DayLog = {
  date: string;
  statuses: Record<string, TaskStatus>;
  comment?: string;
  mood?: number;
  createdAt: string;
};

export type Goal = {
  id: string;
  type: "daily" | "monthly" | "yearly";
  title: string;
  target: number;
  unit: "points" | "rub" | "count" | "custom";
  current?: number;
  deadline?: string;
};

export type Achievement = {
  code: string;
  title: string;
  description: string;
  icon: string;
  rarity: "base" | "rare" | "epic" | "legend";
};

export type Quote = {
  quote: string;
  author: string;
};
