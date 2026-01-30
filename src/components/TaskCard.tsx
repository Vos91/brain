"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Task } from "@/types";
import {
  PRIORITY_COLORS,
  CATEGORY_COLORS,
  CATEGORIES,
  ASSIGNEES,
  ASSIGNEE_COLORS,
  PRIORITIES,
  NL,
} from "@/lib/constants";

interface TaskCardProps {
  task: Task;
  onClick: () => void;
  onArchive?: () => void;
}

export function TaskCard({ task, onClick, onArchive }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    return date.toLocaleDateString("nl-NL", { month: "short", day: "numeric" });
  };

  const isOverdue =
    task.due_date &&
    new Date(task.due_date) < new Date() &&
    task.status !== "complete";

  const categoryInfo = CATEGORIES.find((c) => c.id === task.category);
  const assigneeInfo = task.assignee
    ? ASSIGNEES.find((a) => a.id === task.assignee)
    : null;
  const priorityInfo = PRIORITIES.find((p) => p.id === task.priority);

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={`
        group
        bg-[#131920] border border-[#1e2730] rounded-xl
        p-4
        cursor-grab active:cursor-grabbing
        transition-all duration-200
        hover:border-[#2a3441] hover:bg-[#1a2129]
        hover:shadow-lg hover:shadow-black/20
        active:scale-[0.98]
        ${isDragging ? "opacity-50 shadow-2xl scale-[1.02] rotate-1" : ""}
      `}
    >
      {/* Header row: title + priority + archive */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <h4 className="text-sm font-medium text-[--text-primary] leading-snug flex-1 min-w-0 group-hover:text-white transition-colors">
          {task.title}
        </h4>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {onArchive && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onArchive();
              }}
              className="opacity-0 group-hover:opacity-100 p-1.5 text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--bg-tertiary)] rounded-lg transition-all"
              title={NL.archive}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
            </button>
          )}
          <span
            className={`
              text-xs px-2 py-1 rounded-lg border font-medium
              ${PRIORITY_COLORS[task.priority]}
            `}
          >
            {priorityInfo?.label || task.priority}
          </span>
        </div>
      </div>

      {/* Description */}
      {task.description && (
        <p className="text-xs text-[--text-muted] mb-3 line-clamp-2 leading-relaxed">
          {task.description}
        </p>
      )}

      {/* Footer row: category + due date */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <span
          className={`
            text-xs px-2.5 py-1 rounded-lg border font-medium
            ${CATEGORY_COLORS[task.category]}
          `}
        >
          {categoryInfo?.emoji} {categoryInfo?.label}
        </span>

        {task.due_date && (
          <span
            className={`
              text-xs px-2.5 py-1 rounded-lg
              ${
                isOverdue
                  ? "text-rose-400 bg-rose-500/10 border border-rose-500/20 font-medium"
                  : "text-[--text-muted] bg-[#1a2129]"
              }
            `}
          >
            📅 {formatDate(task.due_date)}
          </span>
        )}
      </div>

      {/* Metadata row: notes indicator + assignee */}
      {(task.notes || assigneeInfo) && (
        <div className="mt-3 pt-3 border-t border-[#1e2730] flex items-center justify-between gap-2">
          {task.notes ? (
            <span className="text-xs text-[--text-muted] flex items-center gap-1.5">
              <span>📝</span>
              <span>{NL.hasNotes}</span>
            </span>
          ) : (
            <span />
          )}
          {assigneeInfo && (
            <span
              className={`
                text-xs px-2.5 py-1 rounded-lg border font-medium
                ${ASSIGNEE_COLORS[task.assignee!]}
              `}
            >
              {assigneeInfo.emoji} {assigneeInfo.label}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
