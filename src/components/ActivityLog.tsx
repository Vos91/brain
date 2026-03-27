"use client";

import { useState, useMemo } from "react";
import type { Task } from "@/types";
import { NL, STATUSES } from "@/lib/constants";

function getRelativeTime(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);
  const diffWeek = Math.floor(diffDay / 7);

  if (diffMin < 1) return NL.justNow;
  if (diffMin === 1) return NL.oneMinuteAgo;
  if (diffMin < 60) return `${diffMin} ${NL.minutesAgo}`;
  if (diffHr === 1) return NL.oneHourAgo;
  if (diffHr < 24) return `${diffHr} ${NL.hoursAgo}`;
  if (diffDay === 1) return NL.oneDayAgo;
  if (diffDay < 7) return `${diffDay} ${NL.daysAgo}`;
  if (diffWeek === 1) return NL.oneWeekAgo;
  return `${diffWeek} ${NL.weeksAgo}`;
}

function getStatusLabel(status: string): string {
  const s = STATUSES.find((st) => st.id === status);
  return s ? `${s.emoji} ${s.label}` : status;
}

interface ActivityLogProps {
  tasks: Task[];
}

export function ActivityLog({ tasks }: ActivityLogProps) {
  const [isOpen, setIsOpen] = useState(false);

  const recentTasks = useMemo(() => {
    return [...tasks]
      .filter((t) => t.updated_at)
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
      .slice(0, 5);
  }, [tasks]);

  if (recentTasks.length === 0) return null;

  return (
    <div className="px-4 md:px-6 py-1">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
      >
        <span>📋</span>
        <span>{NL.recentChanges}</span>
        <svg
          className={`w-3.5 h-3.5 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="mt-2 space-y-1.5 pb-1">
          {recentTasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center gap-2 text-xs text-[var(--text-muted)] py-1 px-2 rounded-lg bg-[var(--bg-tertiary)]/50"
            >
              <span className="text-[var(--text-muted)] opacity-70 shrink-0 w-24 text-right">
                {getRelativeTime(task.updated_at)}
              </span>
              <span className="text-[var(--text-primary)] font-medium truncate flex-1">
                {task.title}
              </span>
              <span className="shrink-0 text-[10px] opacity-70">
                {NL.inColumn} {getStatusLabel(task.status)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
