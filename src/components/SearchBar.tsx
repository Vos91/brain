"use client";

import { useState, useRef, useEffect } from "react";
import { NL } from "@/lib/constants";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchBar({ value, onChange, placeholder = NL.searchPlaceholder }: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  // Keyboard shortcut: / to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "/" && !e.ctrlKey && !e.metaKey) {
        const target = e.target as HTMLElement;
        if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;
        e.preventDefault();
        inputRef.current?.focus();
      }
      // Escape to clear
      if (e.key === "Escape" && document.activeElement === inputRef.current) {
        onChange("");
        inputRef.current?.blur();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onChange]);

  return (
    <div className={`
      relative flex items-center
      transition-all duration-200
      ${isFocused ? "ring-2 ring-[var(--accent)]/30" : ""}
      rounded-lg
    `}>
      {/* Search icon */}
      <div className="absolute left-3 pointer-events-none">
        <svg
          className={`w-4 h-4 transition-colors ${isFocused ? "text-[var(--accent)]" : "text-[var(--text-muted)]"}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>

      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        className="
          w-full pl-9 pr-10 py-2.5
          bg-[var(--bg-tertiary)] border border-[var(--border)]
          rounded-lg text-sm text-[var(--text-primary)]
          placeholder:text-[var(--text-muted)]
          focus:outline-none focus:border-[var(--accent)]
          transition-colors
        "
      />

      {/* Clear button */}
      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute right-3 p-0.5 hover:bg-[var(--border)] rounded transition-colors"
        >
          <svg
            className="w-4 h-4 text-[var(--text-muted)]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}

      {/* Keyboard hint */}
      {!value && !isFocused && (
        <kbd className="absolute right-3 px-1.5 py-0.5 bg-[var(--bg-secondary)] border border-[var(--border)] rounded text-xs text-[var(--text-muted)]">
          /
        </kbd>
      )}
    </div>
  );
}
