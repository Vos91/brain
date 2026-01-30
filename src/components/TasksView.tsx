"use client";

import { useState, useEffect, useCallback } from "react";
import type { Task, TaskStatus } from "@/types";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { TaskBoard } from "./TaskBoard";
import { TaskModal } from "./TaskModal";
import { AddTaskForm } from "./AddTaskForm";
import { KeyboardShortcuts } from "./KeyboardShortcuts";
import { FloatingAddButton } from "./FloatingAddButton";
import { ArieFox } from "./arie/ArieFox";
import { NL } from "@/lib/constants";

export function TasksView() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showArchived, setShowArchived] = useState(false);

  // Check if Supabase is configured
  const isConfigured = isSupabaseConfigured();
  
  // Filter tasks: exclude archived unless showArchived is true
  const activeTasks = tasks.filter(t => t.status !== 'archived');
  const archivedTasks = tasks.filter(t => t.status === 'archived');

  // Fetch tasks
  useEffect(() => {
    if (isConfigured) {
      fetchTasks();
    } else {
      setLoading(false);
    }
  }, [isConfigured]);

  const fetchTasks = async () => {
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
  };

  const handleMoveTask = async (taskId: string, newStatus: TaskStatus) => {
    if (!supabase) return;
    
    // Optimistic update
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );

    try {
      const { error } = await supabase
        .from("tasks")
        .update({ status: newStatus })
        .eq("id", taskId);

      if (error) throw error;
    } catch (err) {
      // Revert on error
      fetchTasks();
      console.error("Failed to move task:", err);
    }
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const handleSaveTask = async (updatedTask: Task) => {
    if (!supabase) return;
    
    // Optimistic update
    setTasks((prev) =>
      prev.map((t) => (t.id === updatedTask.id ? updatedTask : t))
    );

    try {
      const { error } = await supabase
        .from("tasks")
        .update({
          title: updatedTask.title,
          description: updatedTask.description,
          status: updatedTask.status,
          priority: updatedTask.priority,
          category: updatedTask.category,
          assignee: updatedTask.assignee,
          notes: updatedTask.notes,
          due_date: updatedTask.due_date,
        })
        .eq("id", updatedTask.id);

      if (error) throw error;
    } catch (err) {
      fetchTasks();
      console.error("Failed to save task:", err);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!supabase) return;
    
    // Optimistic update
    setTasks((prev) => prev.filter((t) => t.id !== taskId));

    try {
      const { error } = await supabase.from("tasks").delete().eq("id", taskId);

      if (error) throw error;
    } catch (err) {
      fetchTasks();
      console.error("Failed to delete task:", err);
    }
  };

  const handleArchiveTask = async (taskId: string) => {
    if (!supabase) return;
    
    // Optimistic update
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: 'archived' as const } : t))
    );

    try {
      const { error } = await supabase
        .from("tasks")
        .update({ status: 'archived' })
        .eq("id", taskId);

      if (error) throw error;
    } catch (err) {
      fetchTasks();
      console.error("Failed to archive task:", err);
    }
  };

  const handleArchiveAllComplete = async () => {
    if (!supabase) return;
    
    const completeTasks = tasks.filter(t => t.status === 'complete');
    if (completeTasks.length === 0) return;

    // Optimistic update
    setTasks((prev) =>
      prev.map((t) => (t.status === 'complete' ? { ...t, status: 'archived' as const } : t))
    );

    try {
      const { error } = await supabase
        .from("tasks")
        .update({ status: 'archived' })
        .eq("status", "complete");

      if (error) throw error;
    } catch (err) {
      fetchTasks();
      console.error("Failed to archive all complete tasks:", err);
    }
  };

  const handleRestoreTask = async (taskId: string) => {
    if (!supabase) return;
    
    // Optimistic update
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: 'complete' as const } : t))
    );

    try {
      const { error } = await supabase
        .from("tasks")
        .update({ status: 'complete' })
        .eq("id", taskId);

      if (error) throw error;
    } catch (err) {
      fetchTasks();
      console.error("Failed to restore task:", err);
    }
  };

  const handleAddTask = async (
    newTask: Omit<Task, "id" | "created_at" | "updated_at" | "completed_at">
  ) => {
    if (!supabase) return;
    
    try {
      const { data, error } = await supabase
        .from("tasks")
        .insert([newTask])
        .select()
        .single();

      if (error) throw error;
      if (data) {
        setTasks((prev) => [data, ...prev]);
      }
      setShowAddForm(false);
    } catch (err) {
      console.error("Failed to add task:", err);
    }
  };

  // Keyboard shortcut handler
  const handleNewTaskShortcut = useCallback(() => {
    setShowAddForm(true);
  }, []);

  // Not configured state
  if (!isConfigured) {
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
          <p className="text-[var(--text-muted)] text-sm">
            Check je Supabase configuratie in .env.local
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Keyboard shortcuts */}
      <KeyboardShortcuts onNewTask={handleNewTaskShortcut} />

      {/* Add task button / form */}
      <div className="p-4 pb-0">
        {showAddForm ? (
          <AddTaskForm
            onAdd={handleAddTask}
            onCancel={() => setShowAddForm(false)}
          />
        ) : (
          <button
            onClick={() => setShowAddForm(true)}
            className="hidden md:flex items-center gap-2 px-4 py-3 bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] rounded-lg transition-colors font-medium"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            {NL.addTask}
            <kbd className="ml-2 px-1.5 py-0.5 bg-white/20 rounded text-xs">N</kbd>
          </button>
        )}
      </div>

      {/* Task board */}
      <TaskBoard
        tasks={activeTasks}
        onMoveTask={handleMoveTask}
        onTaskClick={handleTaskClick}
        onArchiveTask={handleArchiveTask}
        onArchiveAllComplete={handleArchiveAllComplete}
      />
      
      {/* Archived section toggle */}
      {archivedTasks.length > 0 && (
        <div className="px-4 md:px-6 pb-4">
          <button
            onClick={() => setShowArchived(!showArchived)}
            className="flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
          >
            <span>📦</span>
            {showArchived ? NL.hideArchived : NL.showArchived}
            <span className="px-1.5 py-0.5 bg-[var(--bg-tertiary)] rounded text-xs">
              {archivedTasks.length}
            </span>
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
                {NL.archived} ({archivedTasks.length})
              </h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {archivedTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-3 bg-[var(--bg-primary)] rounded-lg border border-[var(--border)]"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-[var(--text-muted)] truncate">{task.title}</p>
                    </div>
                    <button
                      onClick={() => handleRestoreTask(task.id)}
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
      )}

      {/* Floating action button - mobile only */}
      {!showAddForm && (
        <FloatingAddButton onClick={() => setShowAddForm(true)} />
      )}

      {/* Task modal */}
      <TaskModal
        task={selectedTask}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedTask(null);
        }}
        onSave={handleSaveTask}
        onDelete={handleDeleteTask}
      />
    </div>
  );
}
