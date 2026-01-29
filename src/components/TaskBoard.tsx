"use client";

import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  closestCorners,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { useState, useEffect, useRef, useCallback } from "react";
import type { Task, TaskStatus } from "@/types";
import { STATUSES } from "@/lib/constants";
import { TaskColumn } from "./TaskColumn";
import { TaskCard } from "./TaskCard";

interface TaskBoardProps {
  tasks: Task[];
  onMoveTask: (taskId: string, newStatus: TaskStatus) => void;
  onTaskClick: (task: Task) => void;
}

type CollapsedState = Record<TaskStatus, boolean>;

export function TaskBoard({ tasks, onMoveTask, onTaskClick }: TaskBoardProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [collapsedColumns, setCollapsedColumns] = useState<CollapsedState>({
    todo: false,
    "in-progress": false,
    complete: false,
  });

  // Mobile: active column index for tabbed view
  const [activeColumnIndex, setActiveColumnIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  // Touch/swipe handling
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Load collapsed state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("brainColumnCollapsed");
    if (saved) {
      try {
        setCollapsedColumns(JSON.parse(saved));
      } catch {
        // Ignore
      }
    }

    const savedColumn = localStorage.getItem("brainActiveColumn");
    if (savedColumn) {
      const index = parseInt(savedColumn, 10);
      if (!isNaN(index) && index >= 0 && index < STATUSES.length) {
        setActiveColumnIndex(index);
      }
    }
  }, []);

  const handleColumnChange = useCallback((index: number) => {
    setActiveColumnIndex(index);
    localStorage.setItem("brainActiveColumn", index.toString());
  }, []);

  const toggleColumnCollapse = (statusId: TaskStatus) => {
    setCollapsedColumns((prev) => {
      const newState = { ...prev, [statusId]: !prev[statusId] };
      localStorage.setItem("brainColumnCollapsed", JSON.stringify(newState));
      return newState;
    });
  };

  // Swipe handling for mobile
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (touchStartX.current === null || touchStartY.current === null) return;

      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;
      const diffX = touchStartX.current - touchEndX;
      const diffY = touchStartY.current - touchEndY;

      // Only swipe if horizontal movement is greater than vertical
      if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
        if (diffX > 0 && activeColumnIndex < STATUSES.length - 1) {
          handleColumnChange(activeColumnIndex + 1);
        } else if (diffX < 0 && activeColumnIndex > 0) {
          handleColumnChange(activeColumnIndex - 1);
        }
      }

      touchStartX.current = null;
      touchStartY.current = null;
    },
    [activeColumnIndex, handleColumnChange]
  );

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 5,
      },
    })
  );

  const getTasksByStatus = (status: TaskStatus) => {
    return tasks.filter((task) => task.status === status);
  };

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find((t) => t.id === event.active.id);
    if (task) {
      setActiveTask(task);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const taskId = active.id as string;
    const overId = over.id as string;

    const isOverColumn = STATUSES.some((s) => s.id === overId);

    if (isOverColumn) {
      onMoveTask(taskId, overId as TaskStatus);
    } else {
      const overTask = tasks.find((t) => t.id === overId);
      if (overTask) {
        onMoveTask(taskId, overTask.status);
      }
    }
  };

  // Mobile tabbed view
  if (isMobile) {
    const activeStatus = STATUSES[activeColumnIndex];
    const activeTasks = getTasksByStatus(activeStatus.id);

    return (
      <div className="flex flex-col flex-1 min-h-0 p-4">
        {/* Column tabs */}
        <div className="flex bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg mb-3 p-1">
          {STATUSES.map((status, index) => {
            const count = getTasksByStatus(status.id).length;
            return (
              <button
                key={status.id}
                onClick={() => handleColumnChange(index)}
                className={`
                  flex-1 flex items-center justify-center gap-1.5 py-3 px-2 rounded-md
                  transition-all duration-200 min-h-[48px]
                  ${
                    activeColumnIndex === index
                      ? "bg-[var(--accent)] text-white shadow-sm"
                      : "text-[var(--text-muted)] active:bg-[var(--bg-tertiary)]"
                  }
                `}
              >
                <span className="text-base">{status.emoji}</span>
                <span
                  className={`
                  text-xs px-1.5 py-0.5 rounded-full min-w-[20px] text-center
                  ${
                    activeColumnIndex === index
                      ? "bg-white/20 text-white"
                      : "bg-[var(--border)] text-[var(--text-muted)]"
                  }
                `}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Swipe indicator */}
        <div className="flex justify-center gap-1.5 mb-3">
          {STATUSES.map((_, index) => (
            <div
              key={index}
              className={`
                h-1 rounded-full transition-all duration-200
                ${
                  activeColumnIndex === index
                    ? "w-6 bg-[var(--accent)]"
                    : "w-1.5 bg-[var(--border)]"
                }
              `}
            />
          ))}
        </div>

        {/* Column content with swipe */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div
            ref={containerRef}
            className="flex-1 overflow-y-auto"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <TaskColumn
              id={activeStatus.id}
              title={activeStatus.label}
              emoji={activeStatus.emoji}
              tasks={activeTasks}
              onTaskClick={onTaskClick}
              isCollapsed={false}
              onToggleCollapse={() => {}}
              isMobile={true}
            />
          </div>

          <DragOverlay>
            {activeTask && (
              <div className="rotate-2 scale-105 opacity-90">
                <TaskCard task={activeTask} onClick={() => {}} />
              </div>
            )}
          </DragOverlay>
        </DndContext>

        {/* Swipe hint */}
        <p className="text-center text-xs text-[var(--text-muted)] mt-2 opacity-60">
          ← Swipe om te wisselen →
        </p>
      </div>
    );
  }

  // Desktop view
  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 p-6 overflow-x-auto h-full">
        {STATUSES.map((status) => (
          <TaskColumn
            key={status.id}
            id={status.id}
            title={status.label}
            emoji={status.emoji}
            tasks={getTasksByStatus(status.id)}
            onTaskClick={onTaskClick}
            isCollapsed={collapsedColumns[status.id]}
            onToggleCollapse={() => toggleColumnCollapse(status.id)}
            isMobile={false}
          />
        ))}
      </div>

      <DragOverlay>
        {activeTask && (
          <div className="rotate-3 scale-105">
            <TaskCard task={activeTask} onClick={() => {}} />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
