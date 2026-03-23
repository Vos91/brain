"use client";

import { useState } from "react";
import type { Task, Priority, TaskCategory, Assignee, TaskStatus } from "@/types";
import {
  NL,
  PRIORITIES,
  CATEGORIES,
  ASSIGNEES,
  PRIORITY_COLORS,
  CATEGORY_COLORS,
  ASSIGNEE_COLORS,
} from "@/lib/constants";
import { QuickDatePicker } from "./QuickDatePicker";
import { TASK_TEMPLATES } from "@/lib/templates";

interface AddTaskFormProps {
  onAdd: (task: Omit<Task, "id" | "created_at" | "updated_at" | "completed_at">) => void;
  onCancel: () => void;
  initialStatus?: TaskStatus;
}

export function AddTaskForm({ onAdd, onCancel, initialStatus = "todo" }: AddTaskFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [category, setCategory] = useState<TaskCategory>("dev");
  const [assignee, setAssignee] = useState<Assignee | null>(null);
  const [dueDate, setDueDate] = useState("");
  const [showTemplates, setShowTemplates] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAdd({
      title: title.trim(),
      description: description.trim(),
      status: initialStatus,
      priority,
      category,
      assignee,
      notes: "",
      due_date: dueDate ? new Date(dueDate).toISOString() : null,
    });

    // Reset form
    setTitle("");
    setDescription("");
    setPriority("medium");
    setCategory("dev");
    setAssignee(null);
    setDueDate("");
  };

  return (
    <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl p-4 animate-fade-in">
      {/* Template picker */}
      <div className="mb-4">
        <button
          type="button"
          onClick={() => setShowTemplates(!showTemplates)}
          className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
        >
          <span>📋</span>
          <span>{NL.templates}</span>
          <svg
            className={`w-3 h-3 transition-transform ${showTemplates ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {showTemplates && (
          <div className="flex flex-wrap gap-2 mt-2">
            {TASK_TEMPLATES.map((tpl) => (
              <button
                key={tpl.id}
                type="button"
                onClick={() => {
                  setTitle(tpl.title);
                  setDescription(tpl.description);
                  setPriority(tpl.priority);
                  setCategory(tpl.category);
                  if (tpl.assignee) setAssignee(tpl.assignee);
                  setShowTemplates(false);
                }}
                className="px-3 py-1.5 bg-[var(--bg-tertiary)] border border-[var(--border)] rounded-lg text-xs font-medium text-[var(--text-secondary)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors"
              >
                {tpl.emoji} {tpl.name}
              </button>
            ))}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={NL.whatNeedsToBeDone}
            autoFocus
            maxLength={200}
            className="w-full px-3 py-3 bg-[var(--bg-tertiary)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] text-base"
          />
          {title.length > 150 && (
            <span className="text-xs text-[var(--text-muted)] mt-1 block text-right">
              {title.length}/200
            </span>
          )}
        </div>

        {/* Description */}
        <div>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={NL.descriptionOptional}
            rows={2}
            maxLength={2000}
            className="w-full px-3 py-2 bg-[var(--bg-tertiary)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] text-sm resize-none"
          />
          {description.length > 1500 && (
            <span className="text-xs text-[var(--text-muted)] mt-1 block text-right">
              {description.length}/2000
            </span>
          )}
        </div>

        {/* Priority */}
        <div>
          <label className="block text-xs font-medium text-[var(--text-muted)] mb-2">
            {NL.priority}
          </label>
          <div className="flex gap-2 flex-wrap">
            {PRIORITIES.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPriority(p.id)}
                className={`
                  px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors
                  ${
                    priority === p.id
                      ? PRIORITY_COLORS[p.id]
                      : "bg-[var(--bg-tertiary)] border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--text-muted)]"
                  }
                `}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="block text-xs font-medium text-[var(--text-muted)] mb-2">
            {NL.category}
          </label>
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setCategory(c.id)}
                className={`
                  px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors
                  ${
                    category === c.id
                      ? CATEGORY_COLORS[c.id]
                      : "bg-[var(--bg-tertiary)] border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--text-muted)]"
                  }
                `}
              >
                {c.emoji} {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Assignee */}
        <div>
          <label className="block text-xs font-medium text-[var(--text-muted)] mb-2">
            {NL.assignee}
          </label>
          <div className="flex gap-2 flex-wrap">
            {ASSIGNEES.map((a) => (
              <button
                key={a.id}
                type="button"
                onClick={() => setAssignee(assignee === a.id ? null : a.id)}
                className={`
                  px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors
                  ${
                    assignee === a.id
                      ? ASSIGNEE_COLORS[a.id]
                      : "bg-[var(--bg-tertiary)] border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--text-muted)]"
                  }
                `}
              >
                {a.emoji} {a.label}
              </button>
            ))}
          </div>
        </div>

        {/* Due Date with Quick Picker */}
        <div>
          <label className="block text-xs font-medium text-[var(--text-muted)] mb-2">
            {NL.dueDate}
          </label>
          <QuickDatePicker value={dueDate} onChange={setDueDate} />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--border)] rounded-lg transition-colors text-sm font-medium"
          >
            {NL.cancel}
          </button>
          <button
            type="submit"
            disabled={!title.trim()}
            className="flex-1 px-4 py-2.5 bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors text-sm font-medium"
          >
            {NL.addTask}
          </button>
        </div>
      </form>
    </div>
  );
}
