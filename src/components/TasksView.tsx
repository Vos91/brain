"use client";

import { useState, useCallback, useMemo } from "react";
import type { Task } from "@/types";
import { isSupabaseConfigured } from "@/lib/supabase";
import { useTasks } from "@/hooks/useTasks";
import { TaskBoard } from "./TaskBoard";
import { TaskModal } from "./TaskModal";
import { AddTaskForm } from "./AddTaskForm";
import { KeyboardShortcuts } from "./KeyboardShortcuts";
import { FloatingAddButton } from "./FloatingAddButton";
import { ArieFox } from "./arie/ArieFox";
import { SearchBar } from "./SearchBar";
import { TaskFiltersBar, type TaskFilters as UIFilters } from "./TaskFilters";
import { ErrorBoundary } from "./ErrorBoundary";
import { NetworkStatus } from "./NetworkStatus";
import { NL } from "@/lib/constants";

export function TasksView() {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [uiFilters, setUiFilters] = useState<UIFilters>({
    priority: null,
    category: null,
    assignee: null,
    hasDueDate: null,
  });

  const isConfigured = isSupabaseConfigured();

  // Use the tasks hook with server-side filtering
  const {
    tasks,
    loading,
    error,
    total,
    hasMore,
    setSearch,
    setFilters,
    loadMore,
    refresh,
    addTask,
    editTask,
    moveTask,
    removeTask,
  } = useTasks({ pageSize: 50 });

  // Update server filters when UI filters change
  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
    setSearch(value);
  }, [setSearch]);

  const handleFiltersChange = useCallback((newFilters: UIFilters) => {
    setUiFilters(newFilters);
    setFilters({
      priority: newFilters.priority,
      category: newFilters.category,
      assignee: newFilters.assignee,
      hasDueDate: newFilters.hasDueDate,
    });
  }, [setFilters]);

  // Separate active and archived tasks
  const activeTasks = useMemo(() => tasks.filter(t => t.status !== 'archived'), [tasks]);
  const archivedTasks = useMemo(() => tasks.filter(t => t.status === 'archived'), [tasks]);
  
  const hasActiveFilters = searchQuery || Object.values(uiFilters).some(Boolean);

  // Handlers
  const handleTaskClick = useCallback((task: Task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  }, []);

  const handleSaveTask = useCallback(async (updatedTask: Task) => {
    await editTask(updatedTask);
  }, [editTask]);

  const handleDeleteTask = useCallback(async (taskId: string) => {
    await removeTask(taskId);
  }, [removeTask]);

  const handleArchiveTask = useCallback(async (taskId: string) => {
    await moveTask(taskId, 'archived' as const);
  }, [moveTask]);

  const handleArchiveAllComplete = useCallback(async () => {
    const completeTasks = tasks.filter(t => t.status === 'complete');
    for (const task of completeTasks) {
      await moveTask(task.id, 'archived' as const);
    }
  }, [tasks, moveTask]);

  const handleRestoreTask = useCallback(async (taskId: string) => {
    await moveTask(taskId, 'complete');
  }, [moveTask]);

  const handleAddTask = useCallback(async (newTask: Omit<Task, "id" | "created_at" | "updated_at" | "completed_at">) => {
    const success = await addTask(newTask);
    if (success) {
      setShowAddForm(false);
    }
  }, [addTask]);

  const handleNewTaskShortcut = useCallback(() => setShowAddForm(true), []);
  
  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedTask(null);
  }, []);

  // Render states
  if (!isConfigured) {
    return <NotConfiguredView />;
  }

  if (loading && tasks.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4">
        <ArieFox state="thinking" size={80} />
        <div className="text-[var(--text-muted)]">Taken laden...</div>
      </div>
    );
  }

  if (error && tasks.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4 gap-4">
        <ArieFox state="sleeping" size={80} />
        <div className="text-center">
          <p className="text-rose-400 mb-2">⚠️ {error}</p>
          <p className="text-[var(--text-muted)] text-sm mb-4">Check je internetverbinding</p>
          <button
            onClick={refresh}
            className="px-4 py-2 bg-[var(--accent)] text-white rounded-lg hover:bg-[var(--accent-hover)] transition-colors"
          >
            Opnieuw proberen
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <KeyboardShortcuts onNewTask={handleNewTaskShortcut} />
      <NetworkStatus />

      <div className="p-4 pb-0 space-y-3">
        {showAddForm ? (
          <AddTaskForm onAdd={handleAddTask} onCancel={() => setShowAddForm(false)} />
        ) : (
          <>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <SearchBar 
                  value={searchQuery} 
                  onChange={handleSearchChange} 
                  placeholder="Zoek taken..." 
                />
              </div>
              <AddTaskButton onClick={() => setShowAddForm(true)} />
            </div>
            <TaskFiltersBar filters={uiFilters} onFiltersChange={handleFiltersChange} />
            {(hasActiveFilters || total > 0) && (
              <div className="flex items-center justify-between text-sm text-[var(--text-muted)]">
                <span>
                  {hasActiveFilters 
                    ? `${activeTasks.length} ${activeTasks.length === 1 ? "taak" : "taken"} gevonden`
                    : `${total} taken totaal`
                  }
                </span>
                {hasMore && (
                  <button
                    onClick={loadMore}
                    disabled={loading}
                    className="text-[var(--accent)] hover:underline disabled:opacity-50"
                  >
                    {loading ? "Laden..." : "Meer laden"}
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>

      <ErrorBoundary>
        <TaskBoard
          tasks={activeTasks}
          onMoveTask={moveTask}
          onTaskClick={handleTaskClick}
          onArchiveTask={handleArchiveTask}
          onArchiveAllComplete={handleArchiveAllComplete}
        />
      </ErrorBoundary>
      
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
