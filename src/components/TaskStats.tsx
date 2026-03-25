"use client";

import type { Task } from "@/types";
import { ASSIGNEES, NL } from "@/lib/constants";

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

  // Weekly completion count (Monday-Sunday)
  const completedThisWeek = (() => {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0=Sun, 1=Mon, ...
    const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - diffToMonday);
    monday.setHours(0, 0, 0, 0);
    return tasks.filter(t => {
      if (!t.completed_at) return false;
      return new Date(t.completed_at) >= monday;
    }).length;
  })();

  // 🔥 Productivity Streak — consecutive days with at least 1 task completed
  const productivityStreak = (() => {
    const completedDates = new Set<string>();
    tasks.forEach(t => {
      if (t.completed_at) {
        const d = new Date(t.completed_at);
        completedDates.add(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`);
      }
    });
    
    if (completedDates.size === 0) return 0;
    
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
    
    // Streak must include today or yesterday to be active
    if (!completedDates.has(today) && !completedDates.has(yesterdayStr)) return 0;
    
    let streak = 0;
    const startDate = completedDates.has(today) ? now : yesterday;
    const checkDate = new Date(startDate);
    
    while (true) {
      const dateStr = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, '0')}-${String(checkDate.getDate()).padStart(2, '0')}`;
      if (completedDates.has(dateStr)) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
    
    return streak;
  })();

  // 🎯 Today/Tomorrow focus counts
  const todayTomorrow = (() => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrowStart = new Date(todayStart);
    tomorrowStart.setDate(tomorrowStart.getDate() + 1);
    const dayAfterTomorrow = new Date(tomorrowStart);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

    let today = 0;
    let tomorrow = 0;

    activeTasks.forEach(t => {
      if (!t.due_date || t.status === "complete") return;
      const due = new Date(t.due_date);
      const dueStart = new Date(due.getFullYear(), due.getMonth(), due.getDate());
      if (dueStart.getTime() >= todayStart.getTime() && dueStart.getTime() < tomorrowStart.getTime()) {
        today++;
      } else if (dueStart.getTime() >= tomorrowStart.getTime() && dueStart.getTime() < dayAfterTomorrow.getTime()) {
        tomorrow++;
      }
    });

    return { today, tomorrow };
  })();

  // 📊 Average completion time (for tasks completed in last 30 days)
  const avgCompletionDays = (() => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const completionTimes: number[] = [];
    tasks.forEach(t => {
      if (!t.completed_at || !t.created_at) return;
      const completed = new Date(t.completed_at);
      if (completed < thirtyDaysAgo) return;
      const created = new Date(t.created_at);
      const diffDays = (completed.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
      completionTimes.push(diffDays);
    });

    if (completionTimes.length === 0) return null;
    const avg = completionTimes.reduce((sum, d) => sum + d, 0) / completionTimes.length;
    return Math.round(avg * 10) / 10;
  })();

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
      {completedThisWeek > 0 && (
        <div className="flex items-center gap-1.5 text-[var(--text-muted)]">
          <span>🏆</span>
          <span>{completedThisWeek} {NL.completedThisWeek}</span>
        </div>
      )}
      {/* 🔥 Productivity Streak */}
      {productivityStreak >= 2 && (
        <div className="flex items-center gap-1.5 text-orange-400 font-medium">
          <span>🔥</span>
          <span>{productivityStreak} {productivityStreak === 1 ? NL.oneDayStreak : NL.dayStreak}</span>
        </div>
      )}
      {/* 🎯 Today/Tomorrow Focus */}
      {(todayTomorrow.today > 0 || todayTomorrow.tomorrow > 0) && (
        <div className="flex items-center gap-1.5 text-[var(--text-muted)] border-l border-[var(--border)] pl-4 ml-1">
          <span>🎯</span>
          {todayTomorrow.today > 0 && (
            <span className="text-amber-400 font-medium">{todayTomorrow.today} {NL.dueToday}</span>
          )}
          {todayTomorrow.today > 0 && todayTomorrow.tomorrow > 0 && (
            <span className="text-[var(--text-muted)]">·</span>
          )}
          {todayTomorrow.tomorrow > 0 && (
            <span>{todayTomorrow.tomorrow} {NL.dueTomorrow}</span>
          )}
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
      {/* 📊 Average completion time */}
      {avgCompletionDays !== null && (
        <div className="flex items-center gap-1.5 text-[var(--text-muted)] border-l border-[var(--border)] pl-4 ml-1">
          <span>⚡</span>
          <span>{NL.avgCompletionTime}: </span>
          <span className="font-medium text-[var(--text-primary)]">
            {avgCompletionDays < 1 ? NL.lessThanADay : avgCompletionDays === 1 ? NL.oneDay : `${avgCompletionDays} ${NL.days}`}
          </span>
        </div>
      )}
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
