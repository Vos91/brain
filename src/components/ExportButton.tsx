"use client";

import { useState } from "react";
import type { Task } from "@/types";

interface ExportButtonProps {
  tasks: Task[];
}

export function ExportButton({ tasks }: ExportButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  const exportAsJSON = () => {
    const data = JSON.stringify(tasks, null, 2);
    downloadFile(data, "taken-export.json", "application/json");
    setIsOpen(false);
  };

  const exportAsCSV = () => {
    const headers = ["Titel", "Beschrijving", "Status", "Prioriteit", "Categorie", "Toegewezen", "Deadline", "Notities", "Aangemaakt", "Bijgewerkt"];
    const rows = tasks.map(t => [
      escapeCSV(t.title),
      escapeCSV(t.description),
      t.status,
      t.priority,
      t.category,
      t.assignee || "",
      t.due_date ? new Date(t.due_date).toLocaleDateString("nl-NL") : "",
      escapeCSV(t.notes),
      new Date(t.created_at).toLocaleDateString("nl-NL"),
      new Date(t.updated_at).toLocaleDateString("nl-NL"),
    ]);
    
    const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    downloadFile(csv, "taken-export.csv", "text/csv");
    setIsOpen(false);
  };

  const escapeCSV = (str: string) => {
    if (!str) return "";
    if (str.includes(",") || str.includes('"') || str.includes("\n")) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const downloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] rounded-lg transition-colors"
        title="Exporteren"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        <span className="hidden sm:inline">Export</span>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-full mt-2 z-20 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg shadow-lg overflow-hidden min-w-[140px] animate-fade-in">
            <button
              onClick={exportAsJSON}
              className="w-full px-4 py-2.5 text-left text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] transition-colors flex items-center gap-2"
            >
              <span className="text-base">📄</span> JSON
            </button>
            <button
              onClick={exportAsCSV}
              className="w-full px-4 py-2.5 text-left text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] transition-colors flex items-center gap-2"
            >
              <span className="text-base">📊</span> CSV
            </button>
          </div>
        </>
      )}
    </div>
  );
}
