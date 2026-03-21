"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import type { Task, TaskStatus } from "@/types";
import { TaskCard } from "./TaskCard";
import { NL } from "@/lib/constants";

type SortOption = "default" | "priority" | "due_date" | "newest";

const SORT_OPTIONS: { id: SortOption; label: string }[] = [
  { id: "default", label: NL.sortDefault },
  { id: "priority", label: NL.sortPriority },
  { id: "due_date", label: NL.sortDueDate },
  { id: "newest", label: NL.sortNewest },
];

const PRIORITY_ORDER: Record<string, number> = { high: 0, medium: 1, low: 2 };

function getSortStorageKey(columnId: TaskStatus): string {
  return `brainColumnSort_${columnId}`;
}

function sortTasks(tasks: Task[], sortOption: SortOption): Task[] {
  if (sortOption === "default") return tasks;

  return [...tasks].sort((a, b) => {
    switch (sortOption) {
      case "priority":
        return (PRIORITY_ORDER[a.priority] ?? 2) - (PRIORITY_ORDER[b.priority] ?? 2);
      case "due_date": {
        if (!a.due_date && !b.due_date) return 0;
        if (!a.due_date) return 1;
        if (!b.due_date) return -1;
        return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
      }
      case "newest":
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      default:
        return 0;
    }
  });
}

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
  onTitleUpdate?: (taskId: string, newTitle: string) => void;
  onQuickComplete?: (taskId: string) => void;
}

const EMPTY_STATE_MESSAGES: Record<string, string> = {
  "todo": "📋 Geen taken in de planning",
  "in-progress": "🚀 Niets in uitvoering — begin met slepen!",
  "complete": "✨ Nog niets afgerond",
};

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
  columnId,
  onTaskClick,
  onArchiveTask,
  onTitleUpdate,
  onQuickComplete,
}: {
  tasks: Task[];
  visibleTasks: Task[];
  isCompleteColumn: boolean;
  columnId: TaskStatus;
  onTaskClick: (task: Task) => void;
  onArchiveTask?: (taskId: string) => void;
  onTitleUpdate?: (taskId: string, newTitle: string) => void;
  onQuickComplete?: (taskId: string) => void;
}) {
  if (tasks.length === 0) {
    return (
      <div className="text-center py-8 text-[var(--text-muted)] text-sm border-2 border-dashed border-[var(--border)] rounded-xl">
        <p className="px-4">{EMPTY_STATE_MESSAGES[columnId] || NL.noTasks}</p>
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
          onTitleUpdate={onTitleUpdate}
          onQuickComplete={onQuickComplete}
        />
      ))}
    </>
  );
}

// Sort Dropdown component
function SortDropdown({
  columnId,
  sortOption,
  onSortChange,
}: {
  columnId: TaskStatus;
  sortOption: SortOption;
  onSortChange: (option: SortOption) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className={`
          p-1 rounded-md transition-colors text-xs
          ${sortOption !== "default"
            ? "text-[var(--accent)] bg-[var(--accent)]/10"
            : "text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]"
          }
        `}
        title={NL.sortLabel}
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      </button>
      {isOpen && (
        <div className="absolute top-full right-0 mt-1 z-50 min-w-[160px] bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg shadow-xl shadow-black/30 py-1 animate-fade-in">
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              onClick={(e) => {
                e.stopPropagation();
                onSortChange(opt.id);
                setIsOpen(false);
              }}
              className={`
                w-full text-left px-3 py-2 text-xs transition-colors
                ${sortOption === opt.id
                  ? "text-[var(--accent)] bg-[var(--accent)]/10"
                  : "text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]"
                }
              `}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
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
  onTitleUpdate,
  onQuickComplete,
}: TaskColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id });
  const [showAll, setShowAll] = useState(false);
  const [sortOption, setSortOption] = useState<SortOption>("default");

  // Load sort preference from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(getSortStorageKey(id));
      if (stored && SORT_OPTIONS.some((o) => o.id === stored)) {
        setSortOption(stored as SortOption);
      }
    } catch { /* noop */ }
  }, [id]);

  const handleSortChange = (option: SortOption) => {
    setSortOption(option);
    try {
      localStorage.setItem(getSortStorageKey(id), option);
    } catch { /* noop */ }
  };

  const sortedTasks = useMemo(() => sortTasks(tasks, sortOption), [tasks, sortOption]);

  const isCompleteColumn = id === "complete";
  const hasHiddenTasks = isCompleteColumn && sortedTasks.length > MAX_VISIBLE_COMPLETE;
  const visibleTasks = isCompleteColumn && !showAll 
    ? sortedTasks.slice(0, MAX_VISIBLE_COMPLETE) 
    : sortedTasks;
  const hiddenCount = tasks.length - MAX_VISIBLE_COMPLETE;
  const showArchiveButton = isCompleteColumn && tasks.length > 0 && onArchiveAll;

  // Mobile view
  if (isMobile) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-end mb-2">
          <SortDropdown columnId={id} sortOption={sortOption} onSortChange={handleSortChange} />
        </div>
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
              columnId={id}
              onTaskClick={onTaskClick}
              onArchiveTask={onArchiveTask}
              onTitleUpdate={onTitleUpdate}
              onQuickComplete={onQuickComplete}
            />
          </SortableContext>
          
          {hasHiddenTasks && (
            <ShowMoreButton showAll={showAll} hiddenCount={hiddenCount} onToggle={() => setShowAll(!showAll)} />
          )}
        </div>
      </div>
    );
  }

  // Desktop: Single container with smooth transition
  return (
    <div
      className={`
        flex-shrink-0 flex flex-col bg-[var(--bg-primary)] rounded-xl
        border border-[var(--border)] transition-all duration-300 ease-in-out overflow-hidden
        ${isCollapsed ? "w-14" : "w-80"}
        ${!isCollapsed && isOver ? "ring-2 ring-[var(--accent)] ring-opacity-50" : ""}
      `}
      style={{ minWidth: isCollapsed ? 56 : 320, maxWidth: isCollapsed ? 56 : 320 }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 p-4 border-b border-[var(--border)]">
        {isCollapsed ? (
          <button
            onClick={onToggleCollapse}
            className="flex items-center justify-center w-full hover:bg-[var(--bg-tertiary)] transition-colors rounded-lg"
          >
            <span className="text-lg">{emoji}</span>
          </button>
        ) : (
          <>
            <button
              onClick={onToggleCollapse}
              className="flex items-center gap-2 flex-1 min-w-0 hover:opacity-80 transition-opacity"
            >
              <span className="text-lg">{emoji}</span>
              <span className="font-medium text-[var(--text-primary)] whitespace-nowrap">{title}</span>
              <span className="text-sm text-[var(--text-muted)] bg-[var(--bg-tertiary)] px-2 py-0.5 rounded-full">
                {sortedTasks.length}
              </span>
            </button>
            <SortDropdown columnId={id} sortOption={sortOption} onSortChange={handleSortChange} />
            <button
              onClick={onToggleCollapse}
              className="p-1 hover:bg-[var(--bg-tertiary)] rounded transition-colors"
            >
              <svg className="w-4 h-4 text-[var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            </button>
          </>
        )}
      </div>

      {/* Content */}
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
              columnId={id}
              onTaskClick={onTaskClick}
              onArchiveTask={onArchiveTask}
              onTitleUpdate={onTitleUpdate}
              onQuickComplete={onQuickComplete}
            />
          </SortableContext>
          
          {hasHiddenTasks && (
            <ShowMoreButton showAll={showAll} hiddenCount={hiddenCount} onToggle={() => setShowAll(!showAll)} />
          )}
        </div>
      )}
    </div>
  );
}
