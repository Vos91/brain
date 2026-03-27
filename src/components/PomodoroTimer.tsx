"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { NL } from "@/lib/constants";

type TimerMode = "focus" | "break";

const DEFAULT_FOCUS = 25 * 60;
const DEFAULT_BREAK = 5 * 60;
const STORAGE_KEY = "pomodoroDuration";

function playBeep() {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880;
    osc.type = "sine";
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.5);
    // Play second beep
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.frequency.value = 1100;
    osc2.type = "sine";
    gain2.gain.setValueAtTime(0.3, ctx.currentTime + 0.6);
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.1);
    osc2.start(ctx.currentTime + 0.6);
    osc2.stop(ctx.currentTime + 1.1);
  } catch {
    // Web Audio API not available
  }
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function PomodoroTimer() {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<TimerMode>("focus");
  const [isRunning, setIsRunning] = useState(false);
  const [totalSeconds, setTotalSeconds] = useState(() => {
    if (typeof window === "undefined") return DEFAULT_FOCUS;
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? parseInt(stored, 10) || DEFAULT_FOCUS : DEFAULT_FOCUS;
  });
  const [remaining, setRemaining] = useState(totalSeconds);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (isRunning && remaining > 0) {
      intervalRef.current = setInterval(() => {
        setRemaining((prev) => {
          if (prev <= 1) {
            clearTimer();
            setIsRunning(false);
            playBeep();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return clearTimer;
  }, [isRunning, remaining, clearTimer]);

  const handleStart = () => setIsRunning(true);
  const handlePause = () => {
    setIsRunning(false);
    clearTimer();
  };
  const handleReset = () => {
    setIsRunning(false);
    clearTimer();
    const dur = mode === "focus" ? totalSeconds : DEFAULT_BREAK;
    setRemaining(dur);
  };

  const switchMode = (newMode: TimerMode) => {
    setIsRunning(false);
    clearTimer();
    setMode(newMode);
    if (newMode === "focus") {
      setRemaining(totalSeconds);
    } else {
      setRemaining(DEFAULT_BREAK);
    }
  };

  // Store duration preference
  useEffect(() => {
    if (mode === "focus") {
      try {
        localStorage.setItem(STORAGE_KEY, String(totalSeconds));
      } catch { /* noop */ }
    }
  }, [totalSeconds, mode]);

  const progress = mode === "focus"
    ? 1 - remaining / totalSeconds
    : 1 - remaining / DEFAULT_BREAK;

  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference * (1 - progress);

  // Badge for minimized state
  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="
          fixed bottom-6 left-6 z-50
          w-14 h-14 rounded-full
          bg-gradient-to-br from-violet-500 to-purple-600
          text-white shadow-lg shadow-violet-500/30
          flex items-center justify-center
          hover:scale-105 active:scale-95
          transition-all duration-200
          md:hidden
        "
        aria-label={NL.pomodoroTitle}
      >
        {isRunning ? (
          <span className="text-xs font-bold">{formatTime(remaining)}</span>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )}
      </button>
    );
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
        onClick={() => setIsOpen(false)}
      />
      {/* Timer overlay */}
      <div className="fixed bottom-6 left-6 z-50 w-72 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-2xl shadow-2xl p-6">
        {/* Close button */}
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-3 right-3 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Mode toggle */}
        <div className="flex gap-2 mb-5">
          <button
            onClick={() => switchMode("focus")}
            className={`flex-1 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              mode === "focus"
                ? "bg-violet-500/20 text-violet-400 border border-violet-500/30"
                : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            }`}
          >
            {NL.focus}
          </button>
          <button
            onClick={() => switchMode("break")}
            className={`flex-1 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              mode === "break"
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            }`}
          >
            {NL.pause}
          </button>
        </div>

        {/* Circular progress */}
        <div className="relative w-36 h-36 mx-auto mb-5">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50" cy="50" r="45"
              fill="none"
              stroke="var(--border)"
              strokeWidth="4"
            />
            <circle
              cx="50" cy="50" r="45"
              fill="none"
              stroke={mode === "focus" ? "#8b5cf6" : "#34d399"}
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-1000"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-3xl font-mono font-bold text-[var(--text-primary)]">
              {formatTime(remaining)}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-3">
          {!isRunning ? (
            <button
              onClick={handleStart}
              disabled={remaining === 0}
              className="px-5 py-2 bg-violet-500 hover:bg-violet-600 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors"
            >
              {NL.start}
            </button>
          ) : (
            <button
              onClick={handlePause}
              className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-medium transition-colors"
            >
              {NL.pauseTimer}
            </button>
          )}
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-[var(--bg-tertiary)] hover:bg-[var(--border)] text-[var(--text-secondary)] rounded-lg text-sm font-medium transition-colors"
          >
            {NL.reset}
          </button>
        </div>
      </div>
    </>
  );
}
