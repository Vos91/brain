"use client";

import { useState, useRef, useEffect } from "react";
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
  getTagColorClass,
} from "@/lib/constants";

interface TaskCardProps {
  task: Task;
  onClick: () => void;
  onArchive?: () => void;
  onTitleUpdate?: (taskId: string, newTitle: string) => void;
  onQuickComplete?: (taskId: string) => void;
}

export function TaskCard({ task, onClick, onArchive, onTitleUpdate, onQuickComplete }: TaskCardProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [isCompleting, setIsCompleting] = useState(false);
  const titleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [isEditingTitle]);

  const handleTitleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onTitleUpdate) {
      setEditTitle(task.title);
      setIsEditingTitle(true);
    }
  };

  const handleTitleSave = () => {
    const trimmed = editTitle.trim();
    if (trimmed && trimmed !== task.title && onTitleUpdate) {
      onTitleUpdate(task.id, trimmed);
    }
    setIsEditingTitle(false);
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    e.stopPropagation();
    if (e.key === "Enter") {
      handleTitleSave();
    } else if (e.key === "Escape") {
      setEditTitle(task.title);
      setIsEditingTitle(false);
    }
  };

  const handleQuickComplete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onQuickComplete && task.status !== "complete") {
      setIsCompleting(true);
      setTimeout(() => {
        onQuickComplete(task.id);
        setIsCompleting(false);
      }, 300);
    }
  };

  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
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
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const dateStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const diffMs = dateStart.getTime() - todayStart.getTime();
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Vandaag";
    if (diffDays === 1) return "Morgen";
    if (diffDays === -1) return "Gisteren";
    if (diffDays > 1 && diffDays <= 7) return `Over ${diffDays} dagen`;
    if (diffDays < -1 && diffDays >= -7) return `${Math.abs(diffDays)} dagen geleden`;
    return date.toLocaleDateString("nl-NL", { month: "short", day: "numeric" });
  };

  const getDueStatus = () => {
    if (!task.due_date || task.status === "complete") return null;
    const now = new Date();
    const due = new Date(task.due_date);
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const dueStart = new Date(due.getFullYear(), due.getMonth(), due.getDate());
    const diffDays = Math.round((dueStart.getTime() - todayStart.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return "overdue";
    if (diffDays <= 2) return "soon";
    return null;
  };

  const dueStatus = getDueStatus();
  const isOverdue = dueStatus === "overdue";

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
      onClick={onClick}
      className={`
        group
        bg-[#131920] border border-[#1e2730] rounded-xl
        p-4
        transition-all duration-200
        hover:border-[#2a3441] hover:bg-[#1a2129]
        hover:shadow-lg hover:shadow-black/20
        active:scale-[0.98]
        ${isDragging ? "opacity-50 shadow-2xl scale-[1.02] rotate-1" : ""}
      `}
    >
      {/* Header row: drag handle + title + priority + archive */}
      <div className="flex items-start justify-between gap-2 mb-2">
        {/* Drag handle - only this triggers drag */}
        <button
          ref={setActivatorNodeRef}
          {...listeners}
          className="flex-shrink-0 p-1 -ml-1 cursor-grab active:cursor-grabbing text-[var(--text-muted)] hover:text-[var(--text-secondary)] touch-none"
          onClick={(e) => e.stopPropagation()}
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <circle cx="9" cy="5" r="1.5" />
            <circle cx="15" cy="5" r="1.5" />
            <circle cx="9" cy="12" r="1.5" />
            <circle cx="15" cy="12" r="1.5" />
            <circle cx="9" cy="19" r="1.5" />
            <circle cx="15" cy="19" r="1.5" />
          </svg>
        </button>
        {/* Quick complete checkbox */}
        {onQuickComplete && task.status !== "complete" && (
          <button
            onClick={handleQuickComplete}
            className={`
              flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center
              transition-all duration-200
              ${isCompleting
                ? "border-emerald-400 bg-emerald-400 scale-110"
                : "border-[var(--text-muted)] hover:border-emerald-400 hover:bg-emerald-400/10"
              }
            `}
            title="Markeer als voltooid"
          >
            {isCompleting && (
              <svg className="w-3 h-3 text-white animate-scale-check" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </button>
        )}
        {isEditingTitle ? (
          <input
            ref={titleInputRef}
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onBlur={handleTitleSave}
            onKeyDown={handleTitleKeyDown}
            onClick={(e) => e.stopPropagation()}
            className="text-sm font-medium text-[--text-primary] leading-snug flex-1 min-w-0 bg-transparent border-b border-[var(--accent)] outline-none py-0"
          />
        ) : (
          <h4
            className="text-sm font-medium text-[--text-primary] leading-snug flex-1 min-w-0 group-hover:text-white transition-colors cursor-text"
            onDoubleClick={handleTitleDoubleClick}
          >
            {task.title}
          </h4>
        )}
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

      {/* Tags */}
      {task.tags && task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {task.tags.slice(0, 4).map((tag) => (
            <span
              key={tag.id}
              className={`
                text-[10px] px-1.5 py-0.5 rounded border font-medium
                ${getTagColorClass(tag.color)}
              `}
            >
              {tag.name}
            </span>
          ))}
          {task.tags.length > 4 && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--bg-tertiary)] text-[var(--text-muted)]">
              +{task.tags.length - 4}
            </span>
          )}
        </div>
      )}

      {/* Subtask progress */}
      {task.subtasks && task.subtasks.length > 0 && (
        <div className="flex items-center gap-2 mb-3">
          <div className="flex-1 h-1 bg-[#1a2129] rounded-full overflow-hidden">
            <div
              className="h-full bg-[var(--accent)] transition-all duration-300"
              style={{
                width: `${(task.subtasks.filter(s => s.completed).length / task.subtasks.length) * 100}%`
              }}
            />
          </div>
          <span className="text-[10px] text-[var(--text-muted)] font-medium">
            {task.subtasks.filter(s => s.completed).length}/{task.subtasks.length}
          </span>
        </div>
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
              text-xs px-2.5 py-1 rounded-lg flex items-center gap-1
              ${
                dueStatus === "overdue"
                  ? "text-rose-400 bg-rose-500/10 border border-rose-500/20 font-medium"
                  : dueStatus === "soon"
                  ? "text-amber-400 bg-amber-500/10 border border-amber-500/20 font-medium"
                  : "text-[--text-muted] bg-[#1a2129]"
              }
            `}
          >
            📅 {formatDate(task.due_date)}
            {dueStatus === "overdue" && <span className="due-badge due-badge-overdue ml-1">Te laat</span>}
            {dueStatus === "soon" && <span className="due-badge due-badge-warning ml-1">Bijna</span>}
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
