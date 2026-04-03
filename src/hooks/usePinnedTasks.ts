"use client";

import { useState, useCallback, useEffect } from "react";

const STORAGE_KEY = "brainPinnedTasks";

function loadPinned(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? new Set(JSON.parse(stored)) : new Set();
  } catch {
    return new Set();
  }
}

function savePinned(ids: Set<string>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
  } catch { /* noop */ }
}

export function usePinnedTasks() {
  const [pinnedIds, setPinnedIds] = useState<Set<string>>(loadPinned);

  // Sync from localStorage on mount (SSR-safe)
  useEffect(() => {
    setPinnedIds(loadPinned());
  }, []);

  const isPinned = useCallback((taskId: string) => pinnedIds.has(taskId), [pinnedIds]);

  const togglePin = useCallback((taskId: string) => {
    setPinnedIds((prev) => {
      const next = new Set(prev);
      if (next.has(taskId)) {
        next.delete(taskId);
      } else {
        next.add(taskId);
      }
      savePinned(next);
      return next;
    });
  }, []);

  const sortWithPinned = useCallback(
    <T extends { id: string }>(tasks: T[]): T[] => {
      if (pinnedIds.size === 0) return tasks;
      const pinned = tasks.filter((t) => pinnedIds.has(t.id));
      const unpinned = tasks.filter((t) => !pinnedIds.has(t.id));
      return [...pinned, ...unpinned];
    },
    [pinnedIds]
  );

  return { isPinned, togglePin, sortWithPinned };
}
