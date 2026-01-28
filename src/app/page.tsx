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
  const [sidebarOpen, setSidebarOpen] = useState(true);

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

  return (
    <div className="h-screen flex overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-72" : "w-0"
        } transition-all duration-200 flex-shrink-0 border-r border-[--border] bg-[--bg-secondary] overflow-hidden`}
      >
        <Sidebar
          documents={documents}
          selectedSlug={selectedDoc?.slug}
          onSelect={handleSelectDocument}
          loading={loading}
        />
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-12 flex items-center px-4 border-b border-[--border] bg-[--bg-secondary] flex-shrink-0">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded hover:bg-[--bg-tertiary] text-[--text-secondary] mr-3"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <span className="text-lg">🧠</span>
            <h1 className="font-semibold text-[--text-primary]">2nd Brain</h1>
          </div>
          {selectedDoc && (
            <>
              <span className="mx-3 text-[--text-muted]">/</span>
              <span className="text-sm text-[--text-secondary] capitalize">{selectedDoc.category}</span>
              <span className="mx-2 text-[--text-muted]">/</span>
              <span className="text-sm text-[--text-primary]">{selectedDoc.title}</span>
            </>
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
