import { BookOpen, Briefcase, Dumbbell, Shield, Sparkles, Wallet } from "lucide-react";
import { CategoryKey } from "@/lib/types";

const map = {
  work: Briefcase,
  discipline: Shield,
  study: BookOpen,
  life: Sparkles,
  money: Wallet,
  health: Dumbbell,
};

export function CategoryIcon({ category, className = "h-5 w-5" }: { category: CategoryKey; className?: string }) {
  const Icon = map[category];
  return <Icon className={className} />;
}
