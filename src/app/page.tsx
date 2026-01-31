"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { DocumentView } from "@/components/DocumentView";
import { WelcomeView } from "@/components/WelcomeView";
import { TasksView } from "@/components/TasksView";
import { LoginForm } from "@/components/LoginForm";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { supabase } from "@/lib/supabase";
import type { DocumentMeta, Document, AppView } from "@/types";
import type { User } from "@supabase/supabase-js";

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [documents, setDocuments] = useState<DocumentMeta[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState<AppView>("tasks");

  // Check auth state
  useEffect(() => {
    if (!supabase) {
      setAuthLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch documents
  useEffect(() => {
    if (user) {
      fetch("/api/documents")
        .then((res) => res.json())
        .then((data) => {
          setDocuments(data);
          setLoading(false);
        });
    }
  }, [user]);

  const handleSelectDocument = async (slug: string) => {
    const res = await fetch(`/api/documents/${slug}`);
    const doc = await res.json();
    setSelectedDoc(doc);
  };

  const handleSelectOnMobile = (slug: string) => {
    handleSelectDocument(slug);
    setSidebarOpen(false);
  };

  const handleViewChange = (view: AppView) => {
    setActiveView(view);
    setSelectedDoc(null);
    setSidebarOpen(false);
  };

  const handleLogout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
  };

  // Auth loading state
  if (authLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#0c1117]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-2xl animate-pulse">
            🧠
          </div>
          <div className="text-[--text-muted]">Laden...</div>
        </div>
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return <LoginForm />;
  }

  return (
    <div className="h-screen flex overflow-hidden bg-[#0c1117]">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 md:hidden animate-fade-in"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed md:relative z-50 h-full
          transition-all duration-300 ease-out
          w-72 bg-[#131920] border-r border-[#2a3441]
          ${sidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full md:translate-x-0"}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header with close button on mobile */}
          <div className="flex items-center justify-between p-4 border-b border-[#2a3441] md:hidden">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-lg shadow-lg shadow-amber-500/20">
                🧠
              </div>
              <span className="font-semibold text-[--text-primary]">2nd Brain</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 hover:bg-[#1a2129] rounded-lg transition-colors"
            >
              <svg
                className="w-5 h-5 text-[--text-muted]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* View Switcher */}
          <div className="p-3">
            <div className="flex bg-[#0c1117] rounded-xl p-1 border border-[#1e2730]">
              <button
                onClick={() => handleViewChange("tasks")}
                className={`
                  flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-medium transition-all duration-200
                  ${
                    activeView === "tasks"
                      ? "bg-gradient-to-r from-amber-500 to-orange-500 text-[#0c1117] shadow-lg shadow-amber-500/25"
                      : "text-[--text-muted] hover:text-[--text-primary] hover:bg-[#1a2129]"
                  }
                `}
              >
                <span>✅</span>
                <span>Taken</span>
              </button>
              <button
                onClick={() => handleViewChange("documents")}
                className={`
                  flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-medium transition-all duration-200
                  ${
                    activeView === "documents"
                      ? "bg-gradient-to-r from-amber-500 to-orange-500 text-[#0c1117] shadow-lg shadow-amber-500/25"
                      : "text-[--text-muted] hover:text-[--text-primary] hover:bg-[#1a2129]"
                  }
                `}
              >
                <span>📄</span>
                <span>Docs</span>
              </button>
            </div>
          </div>

          {/* Subtle glow line */}
          <div className="mx-3 h-px bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />

          {/* Sidebar content based on view */}
          {activeView === "documents" ? (
            <Sidebar
              documents={documents}
              selectedSlug={selectedDoc?.slug}
              onSelect={handleSelectOnMobile}
              loading={loading}
            />
          ) : (
            <div className="flex-1 p-4">
              <div className="text-sm text-[--text-muted] text-center py-8">
                Taken in hoofdpaneel →
              </div>
            </div>
          )}

          {/* Logout button */}
          <div className="p-3 border-t border-[#1e2730]">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-3 text-sm text-[--text-muted] hover:text-[--text-primary] hover:bg-[#1a2129] rounded-lg transition-all"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              Uitloggen
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-14 flex items-center px-4 border-b border-[#2a3441] bg-[#131920]/80 backdrop-blur-xl flex-shrink-0">
          {/* Hamburger - mobile only */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-[#1a2129] text-[--text-secondary] mr-3 -ml-1 transition-colors md:hidden"
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
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>

          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-base shadow-lg shadow-amber-500/20">
              🧠
            </div>
            <h1 className="font-semibold text-[--text-primary] hidden sm:block">
              2nd Brain
            </h1>
          </div>

          {/* Breadcrumb */}
          {activeView === "documents" && selectedDoc && (
            <div className="hidden sm:flex items-center min-w-0 overflow-hidden ml-3">
              <span className="text-[--text-muted] mx-2">/</span>
              <span className="text-sm text-[--text-secondary] capitalize bg-[#1a2129] px-2 py-0.5 rounded">
                {selectedDoc.category}
              </span>
              <span className="text-[--text-muted] mx-2">/</span>
              <span className="text-sm text-[--text-primary] truncate">
                {selectedDoc.title}
              </span>
            </div>
          )}

          {activeView === "tasks" && (
            <div className="hidden sm:flex items-center ml-3">
              <span className="text-[--text-muted] mx-2">/</span>
              <span className="text-sm text-[--text-primary] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded border border-amber-500/20">
                Taken
              </span>
            </div>
          )}

          {/* Mobile view indicator */}
          <div className="ml-auto flex items-center gap-2 sm:hidden">
            <span className="text-lg">
              {activeView === "documents" ? "📄" : "✅"}
            </span>
          </div>

          {/* Keyboard shortcut hint - desktop only */}
          <div className="ml-auto hidden sm:flex items-center gap-2">
            <span className="text-xs text-[--text-muted]">
              Druk <kbd className="px-1.5 py-0.5 bg-[#1a2129] border border-[#2a3441] rounded text-[--text-secondary]">?</kbd> voor sneltoetsen
            </span>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-auto bg-[#0c1117]">
          <ErrorBoundary>
            {activeView === "documents" ? (
              selectedDoc ? (
                <DocumentView document={selectedDoc} />
              ) : (
                <WelcomeView documentCount={documents.length} />
              )
            ) : (
              <TasksView />
            )}
          </ErrorBoundary>
        </div>
      </main>
    </div>
  );
}
