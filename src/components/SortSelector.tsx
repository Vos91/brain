"use client";

import { useState, useRef, useEffect } from "react";
import { NL } from "@/lib/constants";

type SortOption = { id: string; label: string };

const SORT_OPTIONS: SortOption[] = [
  { id: "default", label: NL.sortDefault },
  { id: "priority", label: NL.sortPriority },
  { id: "due_date", label: NL.sortDueDate },
  { id: "updated", label: NL.sortUpdated },
];

interface SortSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export function SortSelector({ value, onChange }: SortSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const activeLabel = SORT_OPTIONS.find(o => o.id === value)?.label || NL.sortDefault;
  const isActive = value !== "default";

  return (
    <div ref={ref} className="relative flex-shrink-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg transition-colors border
          ${isActive
            ? "border-[var(--accent)]/30 bg-[var(--accent)]/10 text-[var(--accent)]"
            : "border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]"
          }
        `}
        title={NL.sortLabel}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
        <span className="hidden sm:inline">{activeLabel}</span>
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-1 z-50 min-w-[180px] bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg shadow-xl shadow-black/30 py-1 animate-fade-in">
          <div className="px-3 py-1.5 text-xs text-[var(--text-muted)] font-medium uppercase tracking-wider">
            {NL.sortLabel}
          </div>
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              onClick={() => {
                onChange(opt.id);
                setIsOpen(false);
              }}
              className={`
                w-full text-left px-3 py-2 text-sm transition-colors flex items-center gap-2
                ${value === opt.id
                  ? "text-[var(--accent)] bg-[var(--accent)]/10"
                  : "text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]"
                }
              `}
            >
              {value === opt.id && (
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              )}
              {value !== opt.id && <span className="w-3.5" />}
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
