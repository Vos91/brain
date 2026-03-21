"use client";

import type { Task } from "@/types";
import { ASSIGNEES } from "@/lib/constants";

interface TaskStatsProps {
  tasks: Task[];
}

export function TaskStats({ tasks }: TaskStatsProps) {
  const activeTasks = tasks.filter(t => t.status !== "archived");
  
  const stats = {
    todo: activeTasks.filter(t => t.status === "todo").length,
    inProgress: activeTasks.filter(t => t.status === "in-progress").length,
    complete: activeTasks.filter(t => t.status === "complete").length,
    overdue: activeTasks.filter(t => {
      if (!t.due_date || t.status === "complete") return false;
      return new Date(t.due_date) < new Date();
    }).length,
  };

  const completionRate = activeTasks.length > 0 
    ? Math.round((stats.complete / activeTasks.length) * 100) 
    : 0;

  if (activeTasks.length === 0) return null;

  return (
    <div className="flex items-center gap-4 px-4 py-2 bg-[var(--bg-secondary)] border-b border-[var(--border)] text-xs overflow-x-auto">
      <div className="flex items-center gap-1.5 text-[var(--text-muted)]">
        <span className="w-2 h-2 rounded-full bg-slate-400"></span>
        <span>{stats.todo} te doen</span>
      </div>
      <div className="flex items-center gap-1.5 text-[var(--text-muted)]">
        <span className="w-2 h-2 rounded-full bg-blue-400"></span>
        <span>{stats.inProgress} bezig</span>
      </div>
      <div className="flex items-center gap-1.5 text-[var(--text-muted)]">
        <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
        <span>{stats.complete} klaar</span>
      </div>
      {stats.overdue > 0 && (
        <div className="flex items-center gap-1.5 text-rose-400 font-medium">
          <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse"></span>
          <span>{stats.overdue} te laat</span>
        </div>
      )}
      <div className="flex items-center gap-3 border-l border-[var(--border)] pl-4 ml-2">
        {ASSIGNEES.map((assignee) => {
          const count = activeTasks.filter(t => t.assignee === assignee.id).length;
          return (
            <div key={assignee.id} className="flex items-center gap-1 text-[var(--text-muted)]">
              <span>{assignee.emoji}</span>
              <span>{assignee.label}:</span>
              <span className="font-medium text-[var(--text-primary)]">{count}</span>
            </div>
          );
        })}
      </div>
      <div className="ml-auto flex items-center gap-2 text-[var(--text-muted)]">
        <div className="w-20 h-1.5 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
          <div 
            className="h-full bg-emerald-400 transition-all duration-500"
            style={{ width: `${completionRate}%` }}
          />
        </div>
        <span>{completionRate}%</span>
      </div>
    </div>
  );
}
