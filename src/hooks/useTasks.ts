"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useDebouncedCallback } from "use-debounce";
import type { Task, TaskStatus } from "@/types";
import { fetchTasks, createTask, updateTask, deleteTask, type TaskFilters } from "@/lib/api";
import { validateTask, validateNewTask } from "@/lib/schemas";
import { sanitizeObject } from "@/lib/sanitize";
import { toast } from "@/components/Toaster";

interface UseTasksOptions {
  pageSize?: number;
}

interface UseTasksReturn {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  total: number;
  page: number;
  hasMore: boolean;
  filters: TaskFilters;
  setFilters: (filters: TaskFilters) => void;
  setSearch: (search: string) => void;
  loadMore: () => void;
  refresh: () => void;
  addTask: (task: Omit<Task, "id" | "created_at" | "updated_at" | "completed_at">) => Promise<boolean>;
  editTask: (task: Task) => Promise<boolean>;
  moveTask: (taskId: string, newStatus: TaskStatus) => Promise<boolean>;
  removeTask: (taskId: string) => Promise<boolean>;
}

export function useTasks({ pageSize = 50 }: UseTasksOptions = {}): UseTasksReturn {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [filters, setFiltersState] = useState<TaskFilters>({});
  
  // Keep track of previous state for rollback
  const previousTasks = useRef<Task[]>([]);

  // Fetch tasks from server
  const loadTasks = useCallback(async (currentPage: number, currentFilters: TaskFilters, append = false) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetchTasks(currentFilters, { page: currentPage, pageSize });
      
      if (append) {
        setTasks(prev => [...prev, ...response.tasks]);
      } else {
        setTasks(response.tasks);
      }
      
      setTotal(response.total);
      setPage(response.page);
      setHasMore(response.hasMore);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Kon taken niet laden";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [pageSize]);

  // Initial load
  useEffect(() => {
    loadTasks(1, filters);
  }, [loadTasks, filters]);

  // Debounced search
  const debouncedSearch = useDebouncedCallback((search: string) => {
    setFiltersState(prev => ({ ...prev, search: search || undefined }));
    setPage(1);
  }, 300);

  const setSearch = useCallback((search: string) => {
    debouncedSearch(search);
  }, [debouncedSearch]);

  const setFilters = useCallback((newFilters: TaskFilters) => {
    setFiltersState(newFilters);
    setPage(1);
  }, []);

  const loadMore = useCallback(() => {
    if (hasMore && !loading) {
      loadTasks(page + 1, filters, true);
    }
  }, [hasMore, loading, page, filters, loadTasks]);

  const refresh = useCallback(() => {
    loadTasks(1, filters);
  }, [loadTasks, filters]);

  // Optimistic update helper with rollback
  const optimisticUpdate = useCallback(
    async <T>(
      optimisticFn: () => void,
      serverFn: () => Promise<T>,
      successMsg: string,
      errorMsg: string
    ): Promise<boolean> => {
      // Save current state for rollback
      previousTasks.current = [...tasks];
      
      // Apply optimistic update
      optimisticFn();
      
      try {
        await serverFn();
        toast.success(successMsg);
        return true;
      } catch (err) {
        // Rollback on error
        setTasks(previousTasks.current);
        const message = err instanceof Error ? err.message : errorMsg;
        toast.error(message);
        return false;
      }
    },
    [tasks]
  );

  const addTask = useCallback(
    async (taskData: Omit<Task, "id" | "created_at" | "updated_at" | "completed_at">): Promise<boolean> => {
      // Sanitize and validate
      const sanitized = sanitizeObject(taskData);
      const validation = validateNewTask(sanitized);
      
      if (!validation.success) {
        toast.error(validation.error);
        return false;
      }

      try {
        const newTask = await createTask(validation.data);
        setTasks(prev => [newTask, ...prev]);
        setTotal(prev => prev + 1);
        toast.success("Taak toegevoegd");
        return true;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Kon taak niet toevoegen";
        toast.error(message);
        return false;
      }
    },
    []
  );

  const editTask = useCallback(
    async (task: Task): Promise<boolean> => {
      // Sanitize and validate
      const sanitized = sanitizeObject(task);
      const validation = validateTask(sanitized);
      
      if (!validation.success) {
        toast.error(validation.error);
        return false;
      }

      return optimisticUpdate(
        () => setTasks(prev => prev.map(t => t.id === task.id ? task : t)),
        () => updateTask(task.id, validation.data),
        "Taak opgeslagen",
        "Kon taak niet opslaan"
      );
    },
    [optimisticUpdate]
  );

  const moveTask = useCallback(
    async (taskId: string, newStatus: TaskStatus): Promise<boolean> => {
      return optimisticUpdate(
        () => setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t)),
        () => updateTask(taskId, { status: newStatus }),
        "Taak verplaatst",
        "Kon taak niet verplaatsen"
      );
    },
    [optimisticUpdate]
  );

  const removeTask = useCallback(
    async (taskId: string): Promise<boolean> => {
      return optimisticUpdate(
        () => setTasks(prev => prev.filter(t => t.id !== taskId)),
        () => deleteTask(taskId),
        "Taak verwijderd",
        "Kon taak niet verwijderen"
      );
    },
    [optimisticUpdate]
  );

  return {
    tasks,
    loading,
    error,
    total,
    page,
    hasMore,
    filters,
    setFilters,
    setSearch,
    loadMore,
    refresh,
    addTask,
    editTask,
    moveTask,
    removeTask,
  };
}
