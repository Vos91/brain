"use client";

import { useState } from "react";
import type { Priority, TaskCategory, Assignee } from "@/types";
import {
  NL,
  PRIORITIES,
  CATEGORIES,
  ASSIGNEES,
  PRIORITY_COLORS,
  CATEGORY_COLORS,
  ASSIGNEE_COLORS,
} from "@/lib/constants";

export interface TaskFilters {
  priority: Priority | null;
  category: TaskCategory | null;
  assignee: Assignee | null;
  hasDueDate: boolean | null;
}

interface TaskFiltersProps {
  filters: TaskFilters;
  onFiltersChange: (filters: TaskFilters) => void;
}

export function TaskFiltersBar({ filters, onFiltersChange }: TaskFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const activeFiltersCount = [
    filters.priority,
    filters.category,
    filters.assignee,
    filters.hasDueDate,
  ].filter(Boolean).length;

  const clearFilters = () => {
    onFiltersChange({
      priority: null,
      category: null,
      assignee: null,
      hasDueDate: null,
    });
  };

  const updateFilter = <K extends keyof TaskFilters>(key: K, value: TaskFilters[K]) => {
    onFiltersChange({
      ...filters,
      [key]: filters[key] === value ? null : value,
    });
  };

  return (
    <div className="space-y-2">
      {/* Toggle button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`
          flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all
          ${activeFiltersCount > 0 
            ? "bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/25" 
            : "bg-[var(--bg-tertiary)] text-[var(--text-secondary)] border border-[var(--border)] hover:border-[var(--text-muted)]"
          }
        `}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
        <span>Filters</span>
        {activeFiltersCount > 0 && (
          <span className="px-1.5 py-0.5 bg-[var(--accent)] text-white rounded-full text-xs font-medium">
            {activeFiltersCount}
          </span>
        )}
        <svg
          className={`w-4 h-4 transition-transform ${isExpanded ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Filter panel */}
      {isExpanded && (
        <div className="p-4 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl space-y-4 animate-fade-in">
          {/* Priority filter */}
          <div>
            <label className="block text-xs font-medium text-[var(--text-muted)] mb-2">
              {NL.priority}
            </label>
            <div className="flex flex-wrap gap-2">
              {PRIORITIES.map((p) => (
                <button
                  key={p.id}
                  onClick={() => updateFilter("priority", p.id)}
                  className={`
                    px-3 py-1.5 rounded-lg border text-xs font-medium transition-all
                    ${filters.priority === p.id
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

          {/* Category filter */}
          <div>
            <label className="block text-xs font-medium text-[var(--text-muted)] mb-2">
              {NL.category}
            </label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <button
                  key={c.id}
                  onClick={() => updateFilter("category", c.id)}
                  className={`
                    px-3 py-1.5 rounded-lg border text-xs font-medium transition-all
                    ${filters.category === c.id
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

          {/* Assignee filter */}
          <div>
            <label className="block text-xs font-medium text-[var(--text-muted)] mb-2">
              {NL.assignee}
            </label>
            <div className="flex flex-wrap gap-2">
              {ASSIGNEES.map((a) => (
                <button
                  key={a.id}
                  onClick={() => updateFilter("assignee", a.id)}
                  className={`
                    px-3 py-1.5 rounded-lg border text-xs font-medium transition-all
                    ${filters.assignee === a.id
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

          {/* Due date filter */}
          <div>
            <label className="block text-xs font-medium text-[var(--text-muted)] mb-2">
              Deadline
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => updateFilter("hasDueDate", true)}
                className={`
                  px-3 py-1.5 rounded-lg border text-xs font-medium transition-all
                  ${filters.hasDueDate === true
                    ? "bg-amber-500/15 text-amber-400 border-amber-500/25"
                    : "bg-[var(--bg-tertiary)] border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--text-muted)]"
                  }
                `}
              >
                📅 Met deadline
              </button>
              <button
                onClick={() => updateFilter("hasDueDate", false)}
                className={`
                  px-3 py-1.5 rounded-lg border text-xs font-medium transition-all
                  ${filters.hasDueDate === false
                    ? "bg-slate-500/15 text-slate-400 border-slate-500/25"
                    : "bg-[var(--bg-tertiary)] border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--text-muted)]"
                  }
                `}
              >
                Zonder deadline
              </button>
            </div>
          </div>

          {/* Clear button */}
          {activeFiltersCount > 0 && (
            <button
              onClick={clearFilters}
              className="text-sm text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors"
            >
              ✕ Filters wissen
            </button>
          )}
        </div>
      )}
    </div>
  );
}
