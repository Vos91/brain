"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import DOMPurify from "dompurify";
import type { Task, TaskStatus, Priority, TaskCategory, Assignee, Tag, Subtask } from "@/types";
import { toast } from "./Toaster";
import { validateTask } from "@/lib/schemas";
import {
  NL,
  STATUSES,
  PRIORITIES,
  CATEGORIES,
  ASSIGNEES,
  PRIORITY_COLORS,
  CATEGORY_COLORS,
  ASSIGNEE_COLORS,
} from "@/lib/constants";
import { TagInput } from "./TagInput";
import { SubtaskList } from "./SubtaskList";

function renderMarkdown(text: string): string {
  if (!text) return "";
  let html = text
    // Escape HTML first
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  // Bold: **text**
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  // Italic: *text* (but not inside bold)
  html = html.replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, "<em>$1</em>");
  // Inline code: `code`
  html = html.replace(/`([^`]+)`/g, '<code style="background:var(--bg-tertiary);padding:1px 4px;border-radius:3px;font-size:0.85em">$1</code>');
  // URLs: auto-link
  html = html.replace(
    /(https?:\/\/[^\s<]+)/g,
    '<a href="$1" target="_blank" rel="noopener noreferrer" style="color:var(--accent);text-decoration:underline">$1</a>'
  );
  // Bullet lists: lines starting with "- "
  html = html.replace(/^- (.+)$/gm, '<li style="margin-left:1.2em;list-style:disc">$1</li>');
  // Wrap consecutive <li> in <ul>
  html = html.replace(/((?:<li[^>]*>.*?<\/li>\n?)+)/g, '<ul style="margin:0.25em 0">$1</ul>');
  // Line breaks
  html = html.replace(/\n/g, "<br>");
  // Clean up <br> inside <ul>
  html = html.replace(/<ul([^>]*)><br>/g, "<ul$1>");
  html = html.replace(/<br><\/ul>/g, "</ul>");
  return DOMPurify.sanitize(html);
}

interface TaskModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onDuplicate?: (task: Task) => void;
}

function getRelativeTime(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  const diffWeeks = Math.floor(diffDays / 7);

  if (diffMinutes < 1) return NL.justNow;
  if (diffMinutes === 1) return NL.oneMinuteAgo;
  if (diffMinutes < 60) return `${diffMinutes} ${NL.minutesAgo}`;
  if (diffHours === 1) return NL.oneHourAgo;
  if (diffHours < 24) return `${diffHours} ${NL.hoursAgo}`;
  if (diffDays === 1) return NL.oneDayAgo;
  if (diffDays < 7) return `${diffDays} ${NL.daysAgo}`;
  if (diffWeeks === 1) return NL.oneWeekAgo;
  return `${diffWeeks} ${NL.weeksAgo}`;
}

export function TaskModal({
  task,
  isOpen,
  onClose,
  onSave,
  onDelete,
  onDuplicate,
}: TaskModalProps) {
  const [editedTask, setEditedTask] = useState<Task | null>(null);
  const [descriptionPreview, setDescriptionPreview] = useState(false);

  useEffect(() => {
    if (task) {
      setEditedTask({ ...task });
    }
  }, [task]);

  // Check if task has been modified (dirty state)
  const isDirty = useMemo(() => {
    if (!task || !editedTask) return false;
    return JSON.stringify(task) !== JSON.stringify(editedTask);
  }, [task, editedTask]);

  // Close with unsaved changes check
  const handleClose = useCallback(() => {
    if (isDirty) {
      if (confirm(NL.unsavedChanges)) {
        onClose();
      }
    } else {
      onClose();
    }
  }, [isDirty, onClose]);

  // Escape key handler
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape" && isOpen) {
      handleClose();
    }
    // Ctrl/Cmd + S to save
    if ((e.ctrlKey || e.metaKey) && e.key === "s" && isOpen && editedTask) {
      e.preventDefault();
      const validation = validateTask(editedTask);
      if (validation.success) {
        onSave(editedTask);
        onClose();
      } else {
        toast.error(validation.error);
      }
    }
  }, [isOpen, handleClose, onClose, editedTask, onSave]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  if (!isOpen || !editedTask) return null;

  const handleSave = () => {
    if (editedTask) {
      const validation = validateTask(editedTask);
      if (!validation.success) {
        toast.error(validation.error);
        return;
      }
      onSave(editedTask);
      onClose();
    }
  };

  const handleDelete = () => {
    if (editedTask && confirm("Deze taak verwijderen?")) {
      onDelete(editedTask.id);
      onClose();
    }
  };

  const handleDuplicate = () => {
    if (editedTask && onDuplicate) {
      onDuplicate(editedTask);
      onClose();
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("nl-NL", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-fade-in">
        {/* Header */}
        <div className="sticky top-0 bg-[var(--bg-secondary)] border-b border-[var(--border)] p-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">
            {NL.editTask}
          </h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-[var(--bg-tertiary)] rounded-lg transition-colors"
          >
            <svg
              className="w-5 h-5 text-[var(--text-muted)]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
              {NL.title}
            </label>
            <input
              type="text"
              value={editedTask.title}
              onChange={(e) =>
                setEditedTask({ ...editedTask, title: e.target.value })
              }
              className="w-full px-3 py-2 bg-[var(--bg-tertiary)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
            />
          </div>

          {/* Description */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-[var(--text-secondary)]">
                {NL.description}
              </label>
              <button
                type="button"
                onClick={() => setDescriptionPreview(!descriptionPreview)}
                className="text-xs px-2 py-1 rounded-md bg-[var(--bg-tertiary)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors border border-[var(--border)]"
              >
                {descriptionPreview ? "📝 Bewerken" : "👁️ Voorbeeld"}
              </button>
            </div>
            {descriptionPreview ? (
              <div
                className="w-full px-3 py-2 bg-[var(--bg-tertiary)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] text-sm leading-relaxed min-h-[5rem]"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(editedTask.description || "") }}
              />
            ) : (
              <textarea
                value={editedTask.description}
                onChange={(e) =>
                  setEditedTask({ ...editedTask, description: e.target.value })
                }
                rows={3}
                className="w-full px-3 py-2 bg-[var(--bg-tertiary)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] resize-none"
              />
            )}
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
              {NL.status}
            </label>
            <div className="flex gap-2 flex-wrap">
              {STATUSES.map((status) => (
                <button
                  key={status.id}
                  onClick={() =>
                    setEditedTask({ ...editedTask, status: status.id })
                  }
                  className={`
                    px-3 py-2 rounded-lg border text-sm font-medium transition-colors
                    ${
                      editedTask.status === status.id
                        ? "bg-[var(--accent)] border-[var(--accent)] text-white"
                        : "bg-[var(--bg-tertiary)] border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--text-muted)]"
                    }
                  `}
                >
                  {status.emoji} {status.label}
                </button>
              ))}
            </div>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
              {NL.priority}
            </label>
            <div className="flex gap-2 flex-wrap">
              {PRIORITIES.map((priority) => (
                <button
                  key={priority.id}
                  onClick={() =>
                    setEditedTask({ ...editedTask, priority: priority.id })
                  }
                  className={`
                    px-3 py-2 rounded-lg border text-sm font-medium transition-colors
                    ${
                      editedTask.priority === priority.id
                        ? PRIORITY_COLORS[priority.id]
                        : "bg-[var(--bg-tertiary)] border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--text-muted)]"
                    }
                  `}
                >
                  {priority.label}
                </button>
              ))}
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
              {NL.category}
            </label>
            <div className="flex gap-2 flex-wrap">
              {CATEGORIES.map((category) => (
                <button
                  key={category.id}
                  onClick={() =>
                    setEditedTask({ ...editedTask, category: category.id })
                  }
                  className={`
                    px-3 py-2 rounded-lg border text-sm font-medium transition-colors
                    ${
                      editedTask.category === category.id
                        ? CATEGORY_COLORS[category.id]
                        : "bg-[var(--bg-tertiary)] border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--text-muted)]"
                    }
                  `}
                >
                  {category.emoji} {category.label}
                </button>
              ))}
            </div>
          </div>

          {/* Assignee */}
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
              {NL.assignee}
            </label>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() =>
                  setEditedTask({ ...editedTask, assignee: null })
                }
                className={`
                  px-3 py-2 rounded-lg border text-sm font-medium transition-colors
                  ${
                    editedTask.assignee === null
                      ? "bg-[var(--accent)] border-[var(--accent)] text-white"
                      : "bg-[var(--bg-tertiary)] border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--text-muted)]"
                  }
                `}
              >
                Niemand
              </button>
              {ASSIGNEES.map((assignee) => (
                <button
                  key={assignee.id}
                  onClick={() =>
                    setEditedTask({ ...editedTask, assignee: assignee.id })
                  }
                  className={`
                    px-3 py-2 rounded-lg border text-sm font-medium transition-colors
                    ${
                      editedTask.assignee === assignee.id
                        ? ASSIGNEE_COLORS[assignee.id]
                        : "bg-[var(--bg-tertiary)] border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--text-muted)]"
                    }
                  `}
                >
                  {assignee.emoji} {assignee.label}
                </button>
              ))}
            </div>
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
              {NL.dueDate}
            </label>
            <input
              type="date"
              value={editedTask.due_date?.split("T")[0] || ""}
              onChange={(e) =>
                setEditedTask({
                  ...editedTask,
                  due_date: e.target.value
                    ? new Date(e.target.value).toISOString()
                    : null,
                })
              }
              className="w-full px-3 py-2 bg-[var(--bg-tertiary)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
              {NL.notes}
            </label>
            <textarea
              value={editedTask.notes}
              onChange={(e) =>
                setEditedTask({ ...editedTask, notes: e.target.value })
              }
              rows={3}
              placeholder="Notities..."
              className="w-full px-3 py-2 bg-[var(--bg-tertiary)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] resize-none"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
              🏷️ Tags
            </label>
            <TagInput
              tags={editedTask.tags || []}
              onChange={(tags) => setEditedTask({ ...editedTask, tags })}
            />
          </div>

          {/* Subtasks */}
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
              ☑️ Subtaken
            </label>
            <SubtaskList
              subtasks={editedTask.subtasks || []}
              onChange={(subtasks) => setEditedTask({ ...editedTask, subtasks })}
            />
          </div>

          {/* Metadata */}
          <div className="pt-4 border-t border-[var(--border)] text-xs text-[var(--text-muted)] space-y-1">
            <p>Aangemaakt: <span title={formatDate(editedTask.created_at)}>{getRelativeTime(editedTask.created_at)}</span></p>
            <p>Bijgewerkt: <span title={formatDate(editedTask.updated_at)}>{getRelativeTime(editedTask.updated_at)}</span></p>
            {editedTask.completed_at && (
              <p>Voltooid: <span title={formatDate(editedTask.completed_at)}>{getRelativeTime(editedTask.completed_at)}</span></p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-[var(--bg-secondary)] border-t border-[var(--border)] p-4 flex gap-3">
          <button
            onClick={handleDelete}
            className="px-4 py-2 text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors text-sm font-medium"
          >
            {NL.delete}
          </button>
          {onDuplicate && (
            <button
              onClick={handleDuplicate}
              className="px-4 py-2 text-sky-400 hover:bg-sky-500/10 rounded-lg transition-colors text-sm font-medium flex items-center gap-1.5"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              {NL.duplicate}
            </button>
          )}
          <div className="flex-1" />
          <button
            onClick={handleClose}
            className="px-4 py-2 bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--border)] rounded-lg transition-colors text-sm font-medium"
          >
            {NL.cancel}
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] rounded-lg transition-colors text-sm font-medium"
          >
            {NL.save}
          </button>
        </div>
      </div>
    </div>
  );
}
