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

const WIP_LIMIT = 5;

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
  onQuickMove?: (taskId: string, newStatus: TaskStatus) => void;
  onQuickAdd?: (status: TaskStatus) => void;
  totalTasks?: number;
}

const EMPTY_STATE_MESSAGES: Record<string, string> = {
  "todo": NL.emptyTodo,
  "in-progress": NL.emptyInProgress,
  "complete": NL.emptyComplete,
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
  onQuickMove,
  selectMode,
  selectedIds,
  onToggleSelect,
}: {
  tasks: Task[];
  visibleTasks: Task[];
  isCompleteColumn: boolean;
  columnId: TaskStatus;
  onTaskClick: (task: Task) => void;
  onArchiveTask?: (taskId: string) => void;
  onTitleUpdate?: (taskId: string, newTitle: string) => void;
  onQuickComplete?: (taskId: string) => void;
  onQuickMove?: (taskId: string, newStatus: TaskStatus) => void;
  selectMode?: boolean;
  selectedIds?: Set<string>;
  onToggleSelect?: (taskId: string) => void;
}) {
  if (tasks.length === 0) {
    return (
      <div className="text-center py-10 text-[var(--text-muted)] text-sm border-2 border-dashed border-[var(--border)] rounded-xl">
        <p className="px-6 italic leading-relaxed">{EMPTY_STATE_MESSAGES[columnId] || NL.noTasks}</p>
      </div>
    );
  }

  return (
    <>
      {visibleTasks.map((task) => (
        <div key={task.id} className={selectMode && isCompleteColumn ? "flex items-start gap-2" : ""}>
          {selectMode && isCompleteColumn && onToggleSelect && (
            <button
              onClick={(e) => { e.stopPropagation(); onToggleSelect(task.id); }}
              className={`
                flex-shrink-0 mt-4 w-5 h-5 rounded border-2 flex items-center justify-center transition-all
                ${selectedIds?.has(task.id)
                  ? "border-[var(--accent)] bg-[var(--accent)] text-white"
                  : "border-[var(--text-muted)] hover:border-[var(--accent)]"
                }
              `}
            >
              {selectedIds?.has(task.id) && (
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
          )}
          <div className="flex-1 min-w-0">
            <TaskCard
              task={task}
              onClick={() => selectMode && isCompleteColumn && onToggleSelect ? onToggleSelect(task.id) : onTaskClick(task)}
              onArchive={isCompleteColumn && onArchiveTask && !selectMode ? () => onArchiveTask(task.id) : undefined}
              onTitleUpdate={selectMode ? undefined : onTitleUpdate}
              onQuickComplete={selectMode ? undefined : onQuickComplete}
              onQuickMove={selectMode ? undefined : onQuickMove}
            />
          </div>
        </div>
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
  onQuickMove,
  onQuickAdd,
  totalTasks = 0,
}: TaskColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id });
  const [showAll, setShowAll] = useState(false);
  const [sortOption, setSortOption] = useState<SortOption>("default");
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

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

  const toggleSelectMode = () => {
    if (selectMode) {
      setSelectedIds(new Set());
    }
    setSelectMode(!selectMode);
  };

  const toggleTaskSelection = (taskId: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(taskId)) {
        next.delete(taskId);
      } else {
        next.add(taskId);
      }
      return next;
    });
  };

  const handleArchiveSelected = () => {
    if (onArchiveTask) {
      selectedIds.forEach(taskId => onArchiveTask(taskId));
    }
    setSelectedIds(new Set());
    setSelectMode(false);
  };

  const isWipOver = id === "in-progress" && sortedTasks.length > WIP_LIMIT;
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
        <div className="flex items-center justify-end gap-2 mb-2">
          {isCompleteColumn && tasks.length > 0 && (
            <button
              onClick={toggleSelectMode}
              className={`
                px-2 py-1 text-xs rounded-md transition-colors
                ${selectMode
                  ? "text-[var(--accent)] bg-[var(--accent)]/10 font-medium"
                  : "text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]"
                }
              `}
            >
              {NL.select}
            </button>
          )}
          <SortDropdown columnId={id} sortOption={sortOption} onSortChange={handleSortChange} />
        </div>
        {showArchiveButton && !selectMode && (
          <div className="mb-3">
            <ArchiveAllButton onClick={onArchiveAll} size="sm" />
          </div>
        )}
        
        <div className="space-y-3 pb-4 relative">
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
              onQuickMove={onQuickMove}
              selectMode={selectMode}
              selectedIds={selectedIds}
              onToggleSelect={toggleTaskSelection}
            />
          </SortableContext>
          
          {hasHiddenTasks && (
            <ShowMoreButton showAll={showAll} hiddenCount={hiddenCount} onToggle={() => setShowAll(!showAll)} />
          )}

          {/* Floating archive button for bulk select (mobile) */}
          {selectMode && selectedIds.size > 0 && (
            <div className="sticky bottom-2 pt-2">
              <button
                onClick={handleArchiveSelected}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[var(--accent)] text-white rounded-lg hover:bg-[var(--accent-hover)] transition-colors font-medium shadow-lg shadow-black/30"
              >
                📦 Archiveer ({selectedIds.size})
              </button>
            </div>
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
        ${!isCollapsed && isWipOver ? "ring-1 ring-amber-500/40" : ""}
      `}
      style={{ minWidth: isCollapsed ? 56 : 320, maxWidth: isCollapsed ? 56 : 320 }}
    >
      {/* Header */}
      <div className="border-b border-[var(--border)]">
        <div className="flex items-center gap-2 p-4">
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
                {isWipOver && (
                  <span className="text-[10px] text-amber-400 font-medium" title={NL.wipWarning}>
                    ⚠️ WIP: {sortedTasks.length}/{WIP_LIMIT}
                  </span>
                )}
              </button>
              {isCompleteColumn && tasks.length > 0 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSelectMode();
                  }}
                  className={`
                    px-2 py-1 text-xs rounded-md transition-colors
                    ${selectMode
                      ? "text-[var(--accent)] bg-[var(--accent)]/10 font-medium"
                      : "text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]"
                    }
                  `}
                >
                  {NL.select}
                </button>
              )}
              {onQuickAdd && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onQuickAdd(id);
                  }}
                  className="p-1 text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--bg-tertiary)] rounded transition-colors"
                  title={NL.quickAdd}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              )}
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
        {/* Column progress bar */}
        {!isCollapsed && totalTasks > 0 && sortedTasks.length > 0 && (
          <div className="px-4 pb-2">
            <div className="h-0.5 bg-[#1a2129] rounded-full overflow-hidden">
              <div
                className="h-0.5 bg-[var(--accent)] rounded-full transition-all duration-300"
                style={{ width: `${Math.round((sortedTasks.length / totalTasks) * 100)}%` }}
              />
            </div>
          </div>
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
        <div ref={setNodeRef} className="flex-1 overflow-y-auto p-3 space-y-2 min-h-[200px] relative">
          {showArchiveButton && !selectMode && (
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
              onQuickMove={onQuickMove}
              selectMode={selectMode}
              selectedIds={selectedIds}
              onToggleSelect={toggleTaskSelection}
            />
          </SortableContext>
          
          {hasHiddenTasks && (
            <ShowMoreButton showAll={showAll} hiddenCount={hiddenCount} onToggle={() => setShowAll(!showAll)} />
          )}

          {/* Floating archive button for bulk select */}
          {selectMode && selectedIds.size > 0 && (
            <div className="sticky bottom-2 pt-2">
              <button
                onClick={handleArchiveSelected}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[var(--accent)] text-white rounded-lg hover:bg-[var(--accent-hover)] transition-colors font-medium shadow-lg shadow-black/30"
              >
                📦 Archiveer ({selectedIds.size})
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
