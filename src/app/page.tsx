"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { DocumentView } from "@/components/DocumentView";
import { WelcomeView } from "@/components/WelcomeView";
import type { DocumentMeta, Document } from "@/types";

export default function Home() {
  const [documents, setDocuments] = useState<DocumentMeta[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false); // Closed by default on mobile

  useEffect(() => {
    fetch("/api/documents")
      .then((res) => res.json())
      .then((data) => {
        setDocuments(data);
        setLoading(false);
      });
  }, []);

  const handleSelectDocument = async (slug: string) => {
    const res = await fetch(`/api/documents/${slug}`);
    const doc = await res.json();
    setSelectedDoc(doc);
  };

  const handleSelectOnMobile = (slug: string) => {
    handleSelectDocument(slug);
    // Close sidebar on mobile after selection
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  return (
    <div className="h-screen flex overflow-hidden">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-72 translate-x-0" : "w-0 -translate-x-full md:translate-x-0"
        } fixed md:relative z-50 h-full transition-all duration-200 flex-shrink-0 border-r border-[--border] bg-[--bg-secondary] overflow-hidden`}
      >
        <Sidebar
          documents={documents}
          selectedSlug={selectedDoc?.slug}
          onSelect={handleSelectOnMobile}
          loading={loading}
        />
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-14 md:h-12 flex items-center px-4 border-b border-[--border] bg-[--bg-secondary] flex-shrink-0">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 md:p-1.5 rounded hover:bg-[--bg-tertiary] text-[--text-secondary] mr-3 -ml-1"
          >
            <svg className="w-6 h-6 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-lg flex-shrink-0">🧠</span>
            <h1 className="font-semibold text-[--text-primary] hidden sm:block">2nd Brain</h1>
          </div>
          {selectedDoc && (
            <div className="flex items-center min-w-0 overflow-hidden ml-2">
              <span className="mx-2 text-[--text-muted] hidden sm:inline">/</span>
              <span className="text-sm text-[--text-secondary] capitalize hidden md:inline">{selectedDoc.category}</span>
              <span className="mx-2 text-[--text-muted] hidden md:inline">/</span>
              <span className="text-sm text-[--text-primary] truncate">{selectedDoc.title}</span>
            </div>
          )}
        </header>

        {/* Document Area */}
        <div className="flex-1 overflow-auto">
          {selectedDoc ? (
            <DocumentView document={selectedDoc} />
          ) : (
            <WelcomeView documentCount={documents.length} />
          )}
        </div>
      </main>
    </div>
  );
}
