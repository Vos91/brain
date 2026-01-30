"use client";

import { useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import type { Task, TaskStatus } from "@/types";
import { TaskCard } from "./TaskCard";
import { NL } from "@/lib/constants";

interface TaskColumnProps {
  id: TaskStatus;
  title: string;
  emoji: string;
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobile: boolean;
  onArchiveTask?: (taskId: string) => void;
  onArchiveAll?: () => void;
}

const MAX_VISIBLE_COMPLETE = 5;

// Extracted: Archive All Button
function ArchiveAllButton({ onClick, size = "sm" }: { onClick: () => void; size?: "sm" | "xs" }) {
  const sizeClasses = size === "sm" 
    ? "px-3 py-2 text-sm" 
    : "px-3 py-2 text-xs";
  
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-center gap-2 ${sizeClasses} text-[var(--text-muted)] hover:text-[var(--text-primary)] bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] rounded-lg transition-colors border border-[var(--border)]`}
    >
      <span>📦</span>
      {NL.archiveAll}
    </button>
  );
}

// Extracted: Show More/Less Button
function ShowMoreButton({ 
  showAll, 
  hiddenCount, 
  onToggle 
}: { 
  showAll: boolean; 
  hiddenCount: number; 
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className="w-full py-2 text-sm text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors"
    >
      {showAll ? NL.showLess : `${NL.showMore} (${hiddenCount})`}
    </button>
  );
}

// Extracted: Task List Content
function TaskListContent({
  tasks,
  visibleTasks,
  isCompleteColumn,
  onTaskClick,
  onArchiveTask,
}: {
  tasks: Task[];
  visibleTasks: Task[];
  isCompleteColumn: boolean;
  onTaskClick: (task: Task) => void;
  onArchiveTask?: (taskId: string) => void;
}) {
  if (tasks.length === 0) {
    return (
      <div className="text-center py-8 text-[var(--text-muted)] text-sm">
        {NL.noTasks}
      </div>
    );
  }

  return (
    <>
      {visibleTasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          onClick={() => onTaskClick(task)}
          onArchive={isCompleteColumn && onArchiveTask ? () => onArchiveTask(task.id) : undefined}
        />
      ))}
    </>
  );
}

export function TaskColumn({
  id,
  title,
  emoji,
  tasks,
  onTaskClick,
  isCollapsed,
  onToggleCollapse,
  isMobile,
  onArchiveTask,
  onArchiveAll,
}: TaskColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id });
  const [showAll, setShowAll] = useState(false);

  const isCompleteColumn = id === "complete";
  const hasHiddenTasks = isCompleteColumn && tasks.length > MAX_VISIBLE_COMPLETE;
  const visibleTasks = isCompleteColumn && !showAll 
    ? tasks.slice(0, MAX_VISIBLE_COMPLETE) 
    : tasks;
  const hiddenCount = tasks.length - MAX_VISIBLE_COMPLETE;
  const showArchiveButton = isCompleteColumn && tasks.length > 0 && onArchiveAll;

  // Mobile view
  if (isMobile) {
    return (
      <div className="flex flex-col h-full">
        {showArchiveButton && (
          <div className="mb-3">
            <ArchiveAllButton onClick={onArchiveAll} size="sm" />
          </div>
        )}
        
        <div className="space-y-3 pb-4">
          <SortableContext items={visibleTasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
            <TaskListContent
              tasks={tasks}
              visibleTasks={visibleTasks}
              isCompleteColumn={isCompleteColumn}
              onTaskClick={onTaskClick}
              onArchiveTask={onArchiveTask}
            />
          </SortableContext>
          
          {hasHiddenTasks && (
            <ShowMoreButton showAll={showAll} hiddenCount={hiddenCount} onToggle={() => setShowAll(!showAll)} />
          )}
        </div>
      </div>
    );
  }

  // Desktop: Collapsed state
  if (isCollapsed) {
    return (
      <div className="flex-shrink-0 flex flex-col bg-[var(--bg-primary)] rounded-xl border border-[var(--border)] w-14 transition-all duration-200">
        <button
          onClick={onToggleCollapse}
          className="flex items-center justify-center gap-2 p-4 border-b border-[var(--border)] hover:bg-[var(--bg-tertiary)] transition-colors"
        >
          <span className="text-lg">{emoji}</span>
        </button>
        <div className="flex-1 flex flex-col items-center justify-center py-4">
          <span className="text-sm text-[var(--text-muted)] bg-[var(--bg-tertiary)] px-2 py-1 rounded-full mb-3">
            {tasks.length}
          </span>
          <span
            className="text-xs text-[var(--text-muted)] font-medium"
            style={{ writingMode: "vertical-rl", textOrientation: "mixed" }}
          >
            {title}
          </span>
        </div>
      </div>
    );
  }

  // Desktop: Expanded state
  return (
    <div
      className={`
        flex-shrink-0 flex flex-col bg-[var(--bg-primary)] rounded-xl
        border border-[var(--border)] w-80 transition-all duration-200
        ${isOver ? "ring-2 ring-[var(--accent)] ring-opacity-50" : ""}
      `}
    >
      {/* Header */}
      <button
        onClick={onToggleCollapse}
        className="flex items-center gap-2 p-4 border-b border-[var(--border)] hover:bg-[var(--bg-tertiary)] transition-colors"
      >
        <span className="text-lg">{emoji}</span>
        <span className="font-medium text-[var(--text-primary)]">{title}</span>
        <span className="ml-auto text-sm text-[var(--text-muted)] bg-[var(--bg-tertiary)] px-2 py-0.5 rounded-full">
          {tasks.length}
        </span>
        <svg className="w-4 h-4 text-[var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
        </svg>
      </button>

      {/* Task List */}
      <div ref={setNodeRef} className="flex-1 overflow-y-auto p-3 space-y-2 min-h-[200px]">
        {showArchiveButton && (
          <div className="mb-2">
            <ArchiveAllButton onClick={onArchiveAll} size="xs" />
          </div>
        )}
        
        <SortableContext items={visibleTasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          <TaskListContent
            tasks={tasks}
            visibleTasks={visibleTasks}
            isCompleteColumn={isCompleteColumn}
            onTaskClick={onTaskClick}
            onArchiveTask={onArchiveTask}
          />
        </SortableContext>
        
        {hasHiddenTasks && (
          <ShowMoreButton showAll={showAll} hiddenCount={hiddenCount} onToggle={() => setShowAll(!showAll)} />
        )}
      </div>
    </div>
  );
}
