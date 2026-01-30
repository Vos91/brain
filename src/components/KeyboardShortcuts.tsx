"use client";

import { useEffect, useState, useCallback } from "react";

interface KeyboardShortcutsProps {
  onNewTask: () => void;
}

export function KeyboardShortcuts({ onNewTask }: KeyboardShortcutsProps) {
  const [showHelp, setShowHelp] = useState(false);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Don't trigger if typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      // ? or / for help
      if (e.key === "?" || (e.key === "/" && !e.ctrlKey && !e.metaKey)) {
        e.preventDefault();
        setShowHelp((prev) => !prev);
      }

      // N for new task
      if (e.key === "n" || e.key === "N") {
        e.preventDefault();
        onNewTask();
      }

      // Escape to close help
      if (e.key === "Escape") {
        setShowHelp(false);
      }
    },
    [onNewTask]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  if (!showHelp) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in"
      onClick={() => setShowHelp(false)}
    >
      <div
        className="bg-[#131920] border border-[#2a3441] rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-[--text-primary] flex items-center gap-2">
            <span>⌨️</span> Sneltoetsen
          </h2>
          <button
            onClick={() => setShowHelp(false)}
            className="p-1.5 hover:bg-[#1a2129] rounded-lg transition-colors text-[--text-muted]"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-3">
          <ShortcutRow keys={["N"]} description="Nieuwe taak" />
          <ShortcutRow keys={["?"]} description="Sneltoetsen tonen" />
          <ShortcutRow keys={["Esc"]} description="Sluiten" />
        </div>

        <div className="mt-5 pt-4 border-t border-[#2a3441]">
          <p className="text-xs text-[--text-muted] text-center">
            Druk op <kbd className="px-1.5 py-0.5 bg-[#1a2129] rounded text-[--text-secondary]">?</kbd> om te sluiten
          </p>
        </div>
      </div>
    </div>
  );
}

function ShortcutRow({ keys, description }: { keys: string[]; description: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[--text-secondary] text-sm">{description}</span>
      <div className="flex gap-1">
        {keys.map((key) => (
          <kbd
            key={key}
            className="px-2 py-1 bg-[#0c1117] border border-[#2a3441] rounded-lg text-xs font-mono text-[--text-primary] min-w-[28px] text-center"
          >
            {key}
          </kbd>
        ))}
      </div>
    </div>
  );
}
