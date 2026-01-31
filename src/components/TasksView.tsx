"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import type { Task, TaskStatus } from "@/types";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { TaskBoard } from "./TaskBoard";
import { TaskModal } from "./TaskModal";
import { AddTaskForm } from "./AddTaskForm";
import { KeyboardShortcuts } from "./KeyboardShortcuts";
import { FloatingAddButton } from "./FloatingAddButton";
import { ArieFox } from "./arie/ArieFox";
import { SearchBar } from "./SearchBar";
import { TaskFiltersBar, type TaskFilters } from "./TaskFilters";
import { ErrorBoundary } from "./ErrorBoundary";
import { toast } from "./Toaster";
import { validateNewTask } from "@/lib/schemas";
import { NL } from "@/lib/constants";

export function TasksView() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<TaskFilters>({
    priority: null,
    category: null,
    assignee: null,
    hasDueDate: null,
  });

  const isConfigured = isSupabaseConfigured();
  
  // Filter and search tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          task.title.toLowerCase().includes(query) ||
          task.description?.toLowerCase().includes(query) ||
          task.notes?.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      // Priority filter
      if (filters.priority && task.priority !== filters.priority) return false;

      // Category filter
      if (filters.category && task.category !== filters.category) return false;

      // Assignee filter
      if (filters.assignee && task.assignee !== filters.assignee) return false;

      // Due date filter
      if (filters.hasDueDate === true && !task.due_date) return false;
      if (filters.hasDueDate === false && task.due_date) return false;

      return true;
    });
  }, [tasks, searchQuery, filters]);

  const activeTasks = filteredTasks.filter(t => t.status !== 'archived');
  const archivedTasks = filteredTasks.filter(t => t.status === 'archived');
  
  const hasActiveFilters = searchQuery || Object.values(filters).some(Boolean);

  const fetchTasks = useCallback(async () => {
    if (!supabase) return;
    
    try {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTasks(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load tasks");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isConfigured) {
      fetchTasks();
    } else {
      setLoading(false);
    }
  }, [isConfigured, fetchTasks]);

  // Optimistic update helper
  function updateTasksOptimistically(updater: (tasks: Task[]) => Task[]) {
    setTasks(updater);
  }

  // Error handler helper with toast notifications
  async function withErrorHandling<T extends { error: unknown }>(
    operation: PromiseLike<T>,
    errorMsg: string,
    successMsg?: string
  ) {
    const result = await operation;
    if (result.error) {
      fetchTasks(); // Rollback to server state
      toast.error(errorMsg);
      console.error(errorMsg, result.error);
      return false;
    }
    if (successMsg) {
      toast.success(successMsg);
    }
    return true;
  }

  const handleMoveTask = async (taskId: string, newStatus: TaskStatus) => {
    if (!supabase) return;
    updateTasksOptimistically(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    await withErrorHandling(
      supabase.from("tasks").update({ status: newStatus }).eq("id", taskId),
      "Failed to move task:"
    );
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const handleSaveTask = async (updatedTask: Task) => {
    if (!supabase) return;
    updateTasksOptimistically(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
    await withErrorHandling(
      supabase.from("tasks").update({
        title: updatedTask.title,
        description: updatedTask.description,
        status: updatedTask.status,
        priority: updatedTask.priority,
        category: updatedTask.category,
        assignee: updatedTask.assignee,
        notes: updatedTask.notes,
        due_date: updatedTask.due_date,
      }).eq("id", updatedTask.id),
      "Failed to save task:"
    );
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!supabase) return;
    updateTasksOptimistically(prev => prev.filter(t => t.id !== taskId));
    await withErrorHandling(
      supabase.from("tasks").delete().eq("id", taskId),
      "Failed to delete task:"
    );
  };

  const handleArchiveTask = async (taskId: string) => {
    if (!supabase) return;
    updateTasksOptimistically(prev => prev.map(t => t.id === taskId ? { ...t, status: 'archived' as const } : t));
    await withErrorHandling(
      supabase.from("tasks").update({ status: 'archived' }).eq("id", taskId),
      "Failed to archive task:"
    );
  };

  const handleArchiveAllComplete = async () => {
    if (!supabase) return;
    if (!tasks.some(t => t.status === 'complete')) return;
    updateTasksOptimistically(prev => prev.map(t => t.status === 'complete' ? { ...t, status: 'archived' as const } : t));
    await withErrorHandling(
      supabase.from("tasks").update({ status: 'archived' }).eq("status", "complete"),
      "Failed to archive all:"
    );
  };

  const handleRestoreTask = async (taskId: string) => {
    if (!supabase) return;
    updateTasksOptimistically(prev => prev.map(t => t.id === taskId ? { ...t, status: 'complete' as const } : t));
    await withErrorHandling(
      supabase.from("tasks").update({ status: 'complete' }).eq("id", taskId),
      "Failed to restore task:"
    );
  };

  const handleAddTask = async (newTask: Omit<Task, "id" | "created_at" | "updated_at" | "completed_at">) => {
    if (!supabase) return;
    
    // Validate input
    const validation = validateNewTask(newTask);
    if (!validation.success) {
      toast.error(validation.error);
      return;
    }
    
    try {
      const { data, error } = await supabase.from("tasks").insert([validation.data]).select().single();
      if (error) throw error;
      if (data) {
        setTasks(prev => [data, ...prev]);
        toast.success("Taak toegevoegd");
      }
      setShowAddForm(false);
    } catch (err) {
      toast.error("Kon taak niet toevoegen");
      console.error("Failed to add task:", err);
    }
  };

  const handleNewTaskShortcut = useCallback(() => setShowAddForm(true), []);
  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedTask(null);
  }, []);

  // Render states
  if (!isConfigured) {
    return <NotConfiguredView />;
  }

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4">
        <ArieFox state="thinking" size={80} />
        <div className="text-[var(--text-muted)]">Taken laden...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4 gap-4">
        <ArieFox state="sleeping" size={80} />
        <div className="text-center">
          <p className="text-rose-400 mb-2">⚠️ {error}</p>
          <p className="text-[var(--text-muted)] text-sm">Check je Supabase configuratie in .env.local</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <KeyboardShortcuts onNewTask={handleNewTaskShortcut} />

      <div className="p-4 pb-0 space-y-3">
        {showAddForm ? (
          <AddTaskForm onAdd={handleAddTask} onCancel={() => setShowAddForm(false)} />
        ) : (
          <>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <SearchBar 
                  value={searchQuery} 
                  onChange={setSearchQuery} 
                  placeholder="Zoek taken..." 
                />
              </div>
              <AddTaskButton onClick={() => setShowAddForm(true)} />
            </div>
            <TaskFiltersBar filters={filters} onFiltersChange={setFilters} />
            {hasActiveFilters && (
              <div className="text-sm text-[var(--text-muted)]">
                {activeTasks.length} {activeTasks.length === 1 ? "taak" : "taken"} gevonden
              </div>
            )}
          </>
        )}
      </div>

      <TaskBoard
        tasks={activeTasks}
        onMoveTask={handleMoveTask}
        onTaskClick={handleTaskClick}
        onArchiveTask={handleArchiveTask}
        onArchiveAllComplete={handleArchiveAllComplete}
      />
      
      {archivedTasks.length > 0 && (
        <ArchivedSection
          tasks={archivedTasks}
          showArchived={showArchived}
          onToggle={() => setShowArchived(!showArchived)}
          onRestore={handleRestoreTask}
        />
      )}

      {!showAddForm && <FloatingAddButton onClick={() => setShowAddForm(true)} />}

      <TaskModal
        task={selectedTask}
        isOpen={isModalOpen}
        onClose={closeModal}
        onSave={handleSaveTask}
        onDelete={handleDeleteTask}
      />
    </div>
  );
}

// Sub-components
function NotConfiguredView() {
  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="text-4xl mb-4">🔧</div>
        <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-2">
          Supabase configuratie nodig
        </h2>
        <p className="text-[var(--text-muted)] mb-4">
          Om de taken te gebruiken moet je Supabase configureren.
        </p>
        <div className="bg-[var(--bg-tertiary)] rounded-lg p-4 text-left text-sm">
          <p className="text-[var(--text-secondary)] mb-2">
            Maak een <code className="text-[var(--accent)]">.env.local</code> bestand:
          </p>
          <pre className="text-xs text-[var(--text-muted)] overflow-x-auto">
{`NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key`}
          </pre>
        </div>
      </div>
    </div>
  );
}

function AddTaskButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="hidden md:flex items-center gap-2 px-4 py-3 bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] rounded-lg transition-colors font-medium"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
      {NL.addTask}
      <kbd className="ml-2 px-1.5 py-0.5 bg-white/20 rounded text-xs">N</kbd>
    </button>
  );
}

function ArchivedSection({
  tasks,
  showArchived,
  onToggle,
  onRestore,
}: {
  tasks: Task[];
  showArchived: boolean;
  onToggle: () => void;
  onRestore: (taskId: string) => void;
}) {
  return (
    <div className="px-4 md:px-6 pb-4">
      <button
        onClick={onToggle}
        className="flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
      >
        <span>📦</span>
        {showArchived ? NL.hideArchived : NL.showArchived}
        <span className="px-1.5 py-0.5 bg-[var(--bg-tertiary)] rounded text-xs">{tasks.length}</span>
        <svg
          className={`w-4 h-4 transition-transform ${showArchived ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {showArchived && (
        <div className="mt-3 space-y-2 p-4 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border)]">
          <h3 className="text-sm font-medium text-[var(--text-muted)] mb-3">
            {NL.archived} ({tasks.length})
          </h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between p-3 bg-[var(--bg-primary)] rounded-lg border border-[var(--border)]"
              >
                <p className="flex-1 min-w-0 text-sm text-[var(--text-muted)] truncate">{task.title}</p>
                <button
                  onClick={() => onRestore(task.id)}
                  className="ml-2 px-2 py-1 text-xs text-[var(--accent)] hover:bg-[var(--bg-tertiary)] rounded transition-colors"
                >
                  {NL.restore}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
