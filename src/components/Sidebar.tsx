"use client";

import { useState, useMemo } from "react";
import type { DocumentMeta } from "@/types";

interface SidebarProps {
  documents: DocumentMeta[];
  selectedSlug?: string;
  onSelect: (slug: string) => void;
  loading: boolean;
}

const CATEGORY_ICONS: Record<string, string> = {
  concepts: "💡",
  journal: "📔",
  projects: "🚀",
};

const CATEGORY_ORDER = ["journal", "concepts", "projects"];

export function Sidebar({ documents, selectedSlug, onSelect, loading }: SidebarProps) {
  const [search, setSearch] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(CATEGORY_ORDER)
  );

  const filteredDocs = useMemo(() => {
    if (!search) return documents;
    const lower = search.toLowerCase();
    return documents.filter(
      (d) =>
        d.title.toLowerCase().includes(lower) ||
        d.excerpt.toLowerCase().includes(lower)
    );
  }, [documents, search]);

  const groupedDocs = useMemo(() => {
    const groups: Record<string, DocumentMeta[]> = {};
    for (const doc of filteredDocs) {
      if (!groups[doc.category]) groups[doc.category] = [];
      groups[doc.category].push(doc);
    }
    return groups;
  }, [filteredDocs]);

  const toggleCategory = (cat: string) => {
    const next = new Set(expandedCategories);
    if (next.has(cat)) next.delete(cat);
    else next.add(cat);
    setExpandedCategories(next);
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("nl-NL", { day: "numeric", month: "short" });
  };

  if (loading) {
    return (
      <div className="p-4 space-y-3">
        <div className="h-10 skeleton" />
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-14 skeleton" style={{ animationDelay: `${i * 0.1}s` }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="p-3">
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[--text-muted]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Zoeken..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#0c1117] border border-[#1e2730] rounded-xl text-sm text-[--text-primary] placeholder:text-[--text-muted] focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/25 transition-all"
          />
        </div>
      </div>

      {/* Document List */}
      <div className="flex-1 overflow-y-auto px-2 pb-2">
        {CATEGORY_ORDER.filter((cat) => groupedDocs[cat]?.length).map((category, catIndex) => (
          <div key={category} className="mb-1 animate-fade-in" style={{ animationDelay: `${catIndex * 0.05}s` }}>
            <button
              onClick={() => toggleCategory(category)}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[--text-secondary] hover:text-[--text-primary] rounded-lg hover:bg-[#1a2129] transition-colors"
            >
              <svg
                className={`w-3 h-3 transition-transform duration-200 ${
                  expandedCategories.has(category) ? "rotate-90" : ""
                }`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M6 6L14 10L6 14V6Z" />
              </svg>
              <span className="text-base">{CATEGORY_ICONS[category] || "📄"}</span>
              <span className="capitalize font-medium">{category}</span>
              <span className="ml-auto text-xs text-[--text-muted] bg-[#1a2129] px-2 py-0.5 rounded-full">
                {groupedDocs[category].length}
              </span>
            </button>

            {expandedCategories.has(category) && (
              <div className="ml-3 mt-1 space-y-0.5 border-l border-[#1e2730] pl-2">
                {groupedDocs[category].map((doc, docIndex) => (
                  <button
                    key={doc.slug}
                    onClick={() => onSelect(doc.slug)}
                    className={`
                      w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all duration-200
                      animate-fade-in
                      ${
                        selectedSlug === doc.slug
                          ? "bg-gradient-to-r from-amber-500/20 to-orange-500/10 text-amber-400 border-l-2 border-amber-500 -ml-[2px] pl-[14px]"
                          : "text-[--text-secondary] hover:bg-[#1a2129] hover:text-[--text-primary]"
                      }
                    `}
                    style={{ animationDelay: `${(catIndex * 0.05) + (docIndex * 0.03)}s` }}
                  >
                    <div className="font-medium truncate">{doc.title}</div>
                    <div
                      className={`text-xs truncate mt-0.5 ${
                        selectedSlug === doc.slug ? "text-amber-500/60" : "text-[--text-muted]"
                      }`}
                    >
                      {formatDate(doc.updatedAt)}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

        {filteredDocs.length === 0 && (
          <div className="text-center py-12 text-[--text-muted] text-sm">
            {search ? "Geen documenten gevonden" : "Nog geen documenten"}
          </div>
        )}
      </div>
    </div>
  );
}
