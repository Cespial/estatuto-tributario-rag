"use client";

import { clsx } from "clsx";
import { getDeadlineStatusLabel, type DeadlineStatus } from "@/lib/calendar/status";

interface DeadlineStatusBadgeProps {
  status: DeadlineStatus;
  className?: string;
}

export function DeadlineStatusBadge({ status, className }: DeadlineStatusBadgeProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        status === "vencido" &&
          "border-red-200 bg-red-50 text-red-700 dark:border-red-800/60 dark:bg-red-900/30 dark:text-red-200",
        status === "proximo" &&
          "animate-pulse border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-800/60 dark:bg-orange-900/30 dark:text-orange-200",
        status === "vigente" &&
          "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800/60 dark:bg-emerald-900/30 dark:text-emerald-200",
        className
      )}
    >
      {getDeadlineStatusLabel(status)}
    </span>
  );
}

