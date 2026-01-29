"use client";

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
}: TaskColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id,
  });

  // Mobile view - no collapse, full width
  if (isMobile) {
    return (
      <div className="flex flex-col h-full">
        <div className="space-y-3 pb-4">
          <SortableContext
            items={tasks.map((t) => t.id)}
            strategy={verticalListSortingStrategy}
          >
            {tasks.length === 0 ? (
              <div className="text-center py-12 text-[var(--text-muted)] text-sm">
                {NL.noTasks}
              </div>
            ) : (
              tasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onClick={() => onTaskClick(task)}
                />
              ))
            )}
          </SortableContext>
        </div>
      </div>
    );
  }

  // Desktop view with collapse
  return (
    <div
      className={`
        flex-shrink-0 flex flex-col bg-[var(--bg-primary)] rounded-xl
        border border-[var(--border)]
        transition-all duration-200
        ${isCollapsed ? "w-14" : "w-80"}
        ${isOver ? "ring-2 ring-[var(--accent)] ring-opacity-50" : ""}
      `}
    >
      {/* Column Header */}
      <button
        onClick={onToggleCollapse}
        className={`
          flex items-center gap-2 p-4 border-b border-[var(--border)]
          hover:bg-[var(--bg-tertiary)] transition-colors
          ${isCollapsed ? "justify-center" : ""}
        `}
      >
        <span className="text-lg">{emoji}</span>
        {!isCollapsed && (
          <>
            <span className="font-medium text-[var(--text-primary)]">
              {title}
            </span>
            <span className="ml-auto text-sm text-[var(--text-muted)] bg-[var(--bg-tertiary)] px-2 py-0.5 rounded-full">
              {tasks.length}
            </span>
            <svg
              className="w-4 h-4 text-[var(--text-muted)]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
              />
            </svg>
          </>
        )}
      </button>

      {/* Collapsed state - vertical text */}
      {isCollapsed ? (
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
      ) : (
        /* Task List */
        <div
          ref={setNodeRef}
          className="flex-1 overflow-y-auto p-3 space-y-2 min-h-[200px]"
        >
          <SortableContext
            items={tasks.map((t) => t.id)}
            strategy={verticalListSortingStrategy}
          >
            {tasks.length === 0 ? (
              <div className="text-center py-8 text-[var(--text-muted)] text-sm">
                {NL.noTasks}
              </div>
            ) : (
              tasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onClick={() => onTaskClick(task)}
                />
              ))
            )}
          </SortableContext>
        </div>
      )}
    </div>
  );
}
