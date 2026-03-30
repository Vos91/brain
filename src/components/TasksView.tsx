"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import type { Task, TaskStatus } from "@/types";
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
import { ThemeToggle } from "./ThemeToggle";
import { ExportButton } from "./ExportButton";
import { TaskStats } from "./TaskStats";
import { ActivityLog } from "./ActivityLog";
import { PomodoroTimer } from "./PomodoroTimer";
import { SortSelector } from "./SortSelector";
import { toast } from "./Toaster";

export function TasksView() {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [addFormInitialStatus, setAddFormInitialStatus] = useState<TaskStatus>("todo");
  const [showArchived, setShowArchived] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [focusMode, setFocusMode] = useState(() => {
    if (typeof window === "undefined") return false;
    try { return localStorage.getItem("brainFocusMode") === "true"; } catch { return false; }
  });
  const [sortOption, setSortOption] = useState<string>(() => {
    if (typeof window === "undefined") return "default";
    try { return localStorage.getItem("brainTaskSort") || "default"; } catch { return "default"; }
  });
  const [uiFilters, setUiFilters] = useState<UIFilters>(() => {
    if (typeof window === "undefined") return { priority: null, category: null, assignee: null, hasDueDate: null };
    try {
      const stored = localStorage.getItem("brainTaskFilters");
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          priority: parsed.priority ?? null,
          category: parsed.category ?? null,
          assignee: parsed.assignee ?? null,
          hasDueDate: parsed.hasDueDate ?? null,
        };
      }
    } catch { /* noop */ }
    return { priority: null, category: null, assignee: null, hasDueDate: null };
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
    try {
      localStorage.setItem("brainTaskFilters", JSON.stringify(newFilters));
    } catch { /* noop */ }
  }, [setFilters]);

  // Apply persisted filters on mount
  useEffect(() => {
    if (uiFilters.priority || uiFilters.category || uiFilters.assignee || uiFilters.hasDueDate !== null) {
      setFilters({
        priority: uiFilters.priority,
        category: uiFilters.category,
        assignee: uiFilters.assignee,
        hasDueDate: uiFilters.hasDueDate,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Deadline notifications
  useEffect(() => {
    if (tasks.length === 0) return;

    const requestPermission = () => {
      if (typeof window === "undefined" || !("Notification" in window)) return;
      if (Notification.permission === "default") {
        Notification.requestPermission();
      }
    };

    // Request on first user interaction
    const handler = () => {
      requestPermission();
      window.removeEventListener("click", handler);
    };
    window.addEventListener("click", handler);

    const checkDeadlines = () => {
      if (Notification.permission !== "granted") return;
      const today = new Date();
      const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

      const notified = new Set(JSON.parse(sessionStorage.getItem("notifiedDeadlines") || "[]") as string[]);

      tasks.forEach((task) => {
        if (!task.due_date || task.status === "complete" || task.status === "archived") return;
        if (notified.has(task.id)) return;
        const dueDate = task.due_date.slice(0, 10);
        if (dueDate === todayStr) {
          new Notification(NL.deadlineToday, { body: task.title });
          notified.add(task.id);
        }
      });

      sessionStorage.setItem("notifiedDeadlines", JSON.stringify([...notified]));
    };

    checkDeadlines();
    const interval = setInterval(checkDeadlines, 60000);

    return () => {
      clearInterval(interval);
      window.removeEventListener("click", handler);
    };
  }, [tasks]);

  // Dynamic page title with open task count + overdue alert
  const openTaskCount = useMemo(
    () => tasks.filter(t => t.status === 'todo' || t.status === 'in-progress').length,
    [tasks]
  );

  const overdueCount = useMemo(
    () => tasks.filter(t => {
      if (!t.due_date || t.status === 'complete' || t.status === 'archived') return false;
      return new Date(t.due_date) < new Date();
    }).length,
    [tasks]
  );

  useEffect(() => {
    if (overdueCount > 0) {
      // Pulse between overdue indicator and normal title
      let showAlert = true;
      const baseTitle = openTaskCount > 0 ? `(${openTaskCount}) 2nd Brain` : '2nd Brain';
      const alertTitle = `⚠️ ${overdueCount} te laat — 2nd Brain`;
      document.title = alertTitle;
      const interval = setInterval(() => {
        document.title = showAlert ? baseTitle : alertTitle;
        showAlert = !showAlert;
      }, 2000);
      return () => { clearInterval(interval); document.title = '2nd Brain'; };
    } else {
      document.title = openTaskCount > 0 ? `(${openTaskCount}) 2nd Brain` : '2nd Brain';
      return () => { document.title = '2nd Brain'; };
    }
  }, [openTaskCount, overdueCount]);

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
    const task = tasks.find(t => t.id === taskId);
    await moveTask(taskId, 'archived' as const);
    if (task) {
      toast(NL.taskArchived, {
        action: {
          label: NL.undoArchive,
          onClick: () => moveTask(taskId, task.status),
        },
        duration: 5000,
      });
    }
  }, [moveTask, tasks]);

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

  const handleTitleUpdate = useCallback(async (taskId: string, newTitle: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      await editTask({ ...task, title: newTitle, updated_at: new Date().toISOString() });
    }
  }, [tasks, editTask]);

  const toggleFocusMode = useCallback(() => {
    setFocusMode(prev => {
      const next = !prev;
      try { localStorage.setItem("brainFocusMode", String(next)); } catch { /* noop */ }
      return next;
    });
  }, []);

  const handleSortChange = useCallback((value: string) => {
    setSortOption(value);
    try { localStorage.setItem("brainTaskSort", value); } catch { /* noop */ }
  }, []);

  const handleQuickComplete = useCallback(async (taskId: string) => {
    await moveTask(taskId, 'complete');
    toast.success(NL.taskCompleted);
  }, [moveTask]);

  const handleQuickMove = useCallback(async (taskId: string, newStatus: TaskStatus) => {
    await moveTask(taskId, newStatus);
    if (newStatus === 'complete') {
      toast.success(NL.taskCompleted);
    }
  }, [moveTask]);

  const handleQuickAdd = useCallback((status: TaskStatus) => {
    setAddFormInitialStatus(status);
    setShowAddForm(true);
  }, []);

  const handleDuplicateTask = useCallback(async (task: Task) => {
    const duplicated = {
      title: `${task.title} (kopie)`,
      description: task.description,
      status: 'todo' as const,
      priority: task.priority,
      category: task.category,
      assignee: task.assignee,
      notes: task.notes,
      due_date: task.due_date,
      tags: task.tags,
      subtasks: task.subtasks?.map(s => ({ ...s, id: crypto.randomUUID(), completed: false })),
    };
    const success = await addTask(duplicated);
    if (success) {
      toast.success(NL.duplicated);
    }
  }, [addTask]);

  const handleNewTaskShortcut = useCallback(() => {
    setAddFormInitialStatus("todo");
    setShowAddForm(true);
  }, []);
  
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
      <KeyboardShortcuts onNewTask={handleNewTaskShortcut} onToggleFocus={toggleFocusMode} />
      <NetworkStatus />

      <div className="p-4 pb-0 space-y-3">
        {showAddForm ? (
          <AddTaskForm onAdd={handleAddTask} onCancel={() => { setShowAddForm(false); setAddFormInitialStatus("todo"); }} initialStatus={addFormInitialStatus} />
        ) : (
          <>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 flex items-center gap-2">
                <div className="flex-1">
                  <SearchBar 
                    value={searchQuery} 
                    onChange={handleSearchChange} 
                    placeholder="Zoek taken..." 
                  />
                </div>
                <SortSelector value={sortOption} onChange={handleSortChange} />
              </div>
              <div className="flex items-center gap-2">
                <ExportButton tasks={tasks} />
                <ThemeToggle />
                <FocusModeButton active={focusMode} onClick={toggleFocusMode} />
                <AddTaskButton onClick={() => setShowAddForm(true)} />
              </div>
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

      {focusMode && (
        <div className="mx-4 mt-3 flex items-center gap-2 px-3 py-2 bg-[var(--accent)]/10 border border-[var(--accent)]/25 rounded-lg text-sm text-[var(--accent)]">
          <span>🎯</span>
          <span className="font-medium">{NL.focusModeActive}</span>
          <button
            onClick={toggleFocusMode}
            className="ml-auto text-xs px-2 py-1 rounded hover:bg-[var(--accent)]/20 transition-colors"
          >
            {NL.exitFocusMode}
          </button>
        </div>
      )}

      {!focusMode && <TaskStats tasks={tasks} />}
      {!focusMode && <ActivityLog tasks={tasks} />}

      <ErrorBoundary>
        <TaskBoard
          tasks={activeTasks}
          onMoveTask={moveTask}
          onTaskClick={handleTaskClick}
          onArchiveTask={handleArchiveTask}
          onArchiveAllComplete={handleArchiveAllComplete}
          onTitleUpdate={handleTitleUpdate}
          onQuickComplete={handleQuickComplete}
          onQuickMove={handleQuickMove}
          onQuickAdd={handleQuickAdd}
          focusMode={focusMode}
          globalSort={sortOption}
        />
      </ErrorBoundary>
      
      {!focusMode && archivedTasks.length > 0 && (
        <ArchivedSection
          tasks={archivedTasks}
          showArchived={showArchived}
          onToggle={() => setShowArchived(!showArchived)}
          onRestore={handleRestoreTask}
        />
      )}

      {!showAddForm && <FloatingAddButton onClick={() => setShowAddForm(true)} />}
      <PomodoroTimer />

      <TaskModal
        task={selectedTask}
        isOpen={isModalOpen}
        onClose={closeModal}
        onSave={handleSaveTask}
        onDelete={handleDeleteTask}
        onDuplicate={handleDuplicateTask}
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

function FocusModeButton({ active, onClick }: { active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1 px-3 py-2 text-sm rounded-lg transition-colors ${
        active
          ? "bg-[var(--accent)] text-white"
          : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]"
      }`}
      title={active ? NL.exitFocusMode : NL.focusMode}
    >
      🎯
    </button>
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
