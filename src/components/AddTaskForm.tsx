"use client";

import { useState } from "react";
import type { Task, Priority, TaskCategory, Assignee } from "@/types";
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

interface AddTaskFormProps {
  onAdd: (task: Omit<Task, "id" | "created_at" | "updated_at" | "completed_at">) => void;
  onCancel: () => void;
}

export function AddTaskForm({ onAdd, onCancel }: AddTaskFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [category, setCategory] = useState<TaskCategory>("dev");
  const [assignee, setAssignee] = useState<Assignee | null>(null);
  const [dueDate, setDueDate] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAdd({
      title: title.trim(),
      description: description.trim(),
      status: "todo",
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
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={NL.whatNeedsToBeDone}
          autoFocus
          className="w-full px-3 py-3 bg-[var(--bg-tertiary)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] text-base"
        />

        {/* Description */}
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={NL.descriptionOptional}
          rows={2}
          className="w-full px-3 py-2 bg-[var(--bg-tertiary)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] text-sm resize-none"
        />

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
