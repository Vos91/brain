import { supabase } from "./supabase";
import type { Task, TaskStatus, Priority, TaskCategory, Assignee } from "@/types";

export interface TaskFilters {
  search?: string;
  priority?: Priority | null;
  category?: TaskCategory | null;
  assignee?: Assignee | null;
  hasDueDate?: boolean | null;
  status?: TaskStatus[];
}

export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface TasksResponse {
  tasks: Task[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

/**
 * Retry wrapper with exponential backoff
 */
async function withRetry<T>(
  operation: () => Promise<T>,
  retries = MAX_RETRIES
): Promise<T> {
  let lastError: Error | null = null;
  
  for (let i = 0; i < retries; i++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      if (i < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * Math.pow(2, i)));
      }
    }
  }
  
  throw lastError;
}

/**
 * Fetch tasks with server-side filtering and pagination
 */
export async function fetchTasks(
  filters: TaskFilters = {},
  pagination: PaginationParams = { page: 1, pageSize: 50 }
): Promise<TasksResponse> {
  if (!supabase) {
    throw new Error("Supabase not configured");
  }

  return withRetry(async () => {
    if (!supabase) throw new Error("Supabase not configured");
    
    let query = supabase
      .from("tasks")
      .select("*", { count: "exact" });

    // Apply filters
    if (filters.search) {
      query = query.or(
        `title.ilike.%${filters.search}%,description.ilike.%${filters.search}%,notes.ilike.%${filters.search}%`
      );
    }

    if (filters.priority) {
      query = query.eq("priority", filters.priority);
    }

    if (filters.category) {
      query = query.eq("category", filters.category);
    }

    if (filters.assignee) {
      query = query.eq("assignee", filters.assignee);
    }

    if (filters.hasDueDate === true) {
      query = query.not("due_date", "is", null);
    } else if (filters.hasDueDate === false) {
      query = query.is("due_date", null);
    }

    if (filters.status && filters.status.length > 0) {
      query = query.in("status", filters.status);
    }

    // Apply pagination
    const from = (pagination.page - 1) * pagination.pageSize;
    const to = from + pagination.pageSize - 1;

    query = query
      .order("created_at", { ascending: false })
      .range(from, to);

    const { data, error, count } = await query;

    if (error) throw error;

    const total = count || 0;
    const hasMore = from + (data?.length || 0) < total;

    return {
      tasks: data || [],
      total,
      page: pagination.page,
      pageSize: pagination.pageSize,
      hasMore,
    };
  });
}

/**
 * Create a new task
 */
export async function createTask(
  task: Omit<Task, "id" | "created_at" | "updated_at" | "completed_at">
): Promise<Task> {
  return withRetry(async () => {
    if (!supabase) throw new Error("Supabase not configured");
    
    const { data, error } = await supabase
      .from("tasks")
      .insert([task])
      .select()
      .single();

    if (error) throw error;
    return data;
  });
}

/**
 * Update a task
 */
export async function updateTask(
  id: string,
  updates: Partial<Task>
): Promise<Task> {
  return withRetry(async () => {
    if (!supabase) throw new Error("Supabase not configured");
    
    const { data, error } = await supabase
      .from("tasks")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  });
}

/**
 * Delete a task
 */
export async function deleteTask(id: string): Promise<void> {
  return withRetry(async () => {
    if (!supabase) throw new Error("Supabase not configured");
    
    const { error } = await supabase
      .from("tasks")
      .delete()
      .eq("id", id);

    if (error) throw error;
  });
}
