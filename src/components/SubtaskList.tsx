"use client";

import { useState, useRef, useEffect } from "react";
import type { Subtask } from "@/types";

interface SubtaskListProps {
  subtasks: Subtask[];
  onChange: (subtasks: Subtask[]) => void;
  readOnly?: boolean;
}

export function SubtaskList({ subtasks, onChange, readOnly = false }: SubtaskListProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isAdding && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isAdding]);

  useEffect(() => {
    if (editingId && editInputRef.current) {
      editInputRef.current.focus();
    }
  }, [editingId]);

  const handleAddSubtask = () => {
    if (!newSubtaskTitle.trim()) return;

    const newSubtask: Subtask = {
      id: crypto.randomUUID(),
      title: newSubtaskTitle.trim(),
      completed: false,
    };

    onChange([...subtasks, newSubtask]);
    setNewSubtaskTitle("");
  };

  const handleToggleComplete = (id: string) => {
    onChange(
      subtasks.map((s) =>
        s.id === id ? { ...s, completed: !s.completed } : s
      )
    );
  };

  const handleRemoveSubtask = (id: string) => {
    onChange(subtasks.filter((s) => s.id !== id));
  };

  const handleEditSubtask = (id: string) => {
    const subtask = subtasks.find((s) => s.id === id);
    if (subtask) {
      setEditingId(id);
      setEditingTitle(subtask.title);
    }
  };

  const handleSaveEdit = () => {
    if (editingId && editingTitle.trim()) {
      onChange(
        subtasks.map((s) =>
          s.id === editingId ? { ...s, title: editingTitle.trim() } : s
        )
      );
    }
    setEditingId(null);
    setEditingTitle("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddSubtask();
    } else if (e.key === "Escape") {
      setIsAdding(false);
      setNewSubtaskTitle("");
    }
  };

  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSaveEdit();
    } else if (e.key === "Escape") {
      setEditingId(null);
      setEditingTitle("");
    }
  };

  const completedCount = subtasks.filter((s) => s.completed).length;
  const totalCount = subtasks.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <div className="space-y-2">
      {/* Progress bar if there are subtasks */}
      {totalCount > 0 && (
        <div className="flex items-center gap-2 mb-2">
          <div className="flex-1 h-1.5 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
            <div
              className="h-full bg-[var(--accent)] transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-xs text-[var(--text-muted)] font-medium">
            {completedCount}/{totalCount}
          </span>
        </div>
      )}

      {/* Subtask list */}
      <div className="space-y-1">
        {subtasks.map((subtask) => (
          <div
            key={subtask.id}
            className={`
              group flex items-center gap-2 p-2 rounded-lg
              ${subtask.completed ? "bg-[var(--bg-tertiary)]/50" : "bg-[var(--bg-tertiary)]"}
              hover:bg-[var(--border)] transition-colors
            `}
          >
            {/* Checkbox */}
            <button
              onClick={() => !readOnly && handleToggleComplete(subtask.id)}
              disabled={readOnly}
              className={`
                flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center
                transition-all
                ${
                  subtask.completed
                    ? "bg-[var(--accent)] border-[var(--accent)] text-white"
                    : "border-[var(--border)] hover:border-[var(--accent)]"
                }
                ${readOnly ? "cursor-default" : "cursor-pointer"}
              `}
            >
              {subtask.completed && (
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>

            {/* Title */}
            {editingId === subtask.id ? (
              <input
                ref={editInputRef}
                type="text"
                value={editingTitle}
                onChange={(e) => setEditingTitle(e.target.value)}
                onKeyDown={handleEditKeyDown}
                onBlur={handleSaveEdit}
                className="flex-1 px-2 py-0.5 bg-[var(--bg-primary)] border border-[var(--accent)] rounded
                  text-sm text-[var(--text-primary)] focus:outline-none"
              />
            ) : (
              <span
                onClick={() => !readOnly && handleEditSubtask(subtask.id)}
                className={`
                  flex-1 text-sm transition-colors cursor-pointer
                  ${
                    subtask.completed
                      ? "text-[var(--text-muted)] line-through"
                      : "text-[var(--text-primary)]"
                  }
                `}
              >
                {subtask.title}
              </span>
            )}

            {/* Delete button */}
            {!readOnly && (
              <button
                onClick={() => handleRemoveSubtask(subtask.id)}
                className="opacity-0 group-hover:opacity-100 p-1 text-[var(--text-muted)] 
                  hover:text-rose-400 transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Add subtask */}
      {!readOnly && (
        <>
          {isAdding ? (
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Subtaak beschrijving..."
                className="flex-1 px-3 py-1.5 bg-[var(--bg-tertiary)] border border-[var(--border)] rounded-lg
                  text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
              />
              <button
                onClick={handleAddSubtask}
                disabled={!newSubtaskTitle.trim()}
                className="px-3 py-1.5 bg-[var(--accent)] text-white text-xs font-medium rounded-lg
                  hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50"
              >
                +
              </button>
              <button
                onClick={() => {
                  setIsAdding(false);
                  setNewSubtaskTitle("");
                }}
                className="px-3 py-1.5 text-[var(--text-muted)] text-xs font-medium rounded-lg
                  hover:bg-[var(--bg-tertiary)] transition-colors"
              >
                ✕
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsAdding(true)}
              className="w-full flex items-center justify-center gap-1.5 p-2 rounded-lg
                border border-dashed border-[var(--border)] text-[var(--text-muted)]
                hover:border-[var(--text-muted)] hover:text-[var(--text-secondary)]
                transition-colors text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Subtaak toevoegen
            </button>
          )}
        </>
      )}
    </div>
  );
}
