"use client";

import { useState, useEffect } from "react";
import type { Task, TaskStatus, Priority, TaskCategory, Assignee } from "@/types";
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

interface TaskModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Task) => void;
  onDelete: (taskId: string) => void;
}

export function TaskModal({
  task,
  isOpen,
  onClose,
  onSave,
  onDelete,
}: TaskModalProps) {
  const [editedTask, setEditedTask] = useState<Task | null>(null);

  useEffect(() => {
    if (task) {
      setEditedTask({ ...task });
    }
  }, [task]);

  if (!isOpen || !editedTask) return null;

  const handleSave = () => {
    if (editedTask) {
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
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-fade-in">
        {/* Header */}
        <div className="sticky top-0 bg-[var(--bg-secondary)] border-b border-[var(--border)] p-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">
            {NL.editTask}
          </h2>
          <button
            onClick={onClose}
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
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
              {NL.description}
            </label>
            <textarea
              value={editedTask.description}
              onChange={(e) =>
                setEditedTask({ ...editedTask, description: e.target.value })
              }
              rows={3}
              className="w-full px-3 py-2 bg-[var(--bg-tertiary)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] resize-none"
            />
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

          {/* Metadata */}
          <div className="pt-4 border-t border-[var(--border)] text-xs text-[var(--text-muted)] space-y-1">
            <p>Aangemaakt: {formatDate(editedTask.created_at)}</p>
            <p>Bijgewerkt: {formatDate(editedTask.updated_at)}</p>
            {editedTask.completed_at && (
              <p>Voltooid: {formatDate(editedTask.completed_at)}</p>
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
          <div className="flex-1" />
          <button
            onClick={onClose}
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
