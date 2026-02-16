"use client";

import { useState } from "react";
import type { KBSource } from "@/types";
import { NL } from "@/lib/constants";
import { toast } from "@/components/Toaster";
import { formatRelativeDate } from "@/lib/kb-utils";

const SOURCE_ICONS: Record<string, string> = {
  article: '📄', video: '🎬', tweet: '🐦', pdf: '📑', note: '📝',
};

interface KBSourceDetailProps {
  source: KBSource;
  onBack: () => void;
  onDeleted: () => void;
}

export function KBSourceDetail({ source, onBack, onDeleted }: KBSourceDetailProps) {
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirming) {
      setConfirming(true);
      return;
    }
    setDeleting(true);
    try {
      const res = await fetch(`/api/kb/${source.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Verwijderen mislukt");
      toast.success("Bron verwijderd");
      onDeleted();
    } catch {
      toast.error("Verwijderen mislukt");
    } finally {
      setDeleting(false);
      setConfirming(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={onBack}
          className="p-2 hover:bg-[#1a2129] rounded-lg transition-colors text-[--text-muted] hover:text-[--text-primary]"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="text-2xl">{SOURCE_ICONS[source.source_type]}</span>
        <h1 className="text-xl font-semibold text-[--text-primary] flex-1 min-w-0 truncate">
          {source.title}
        </h1>
      </div>

      {/* Meta */}
      <div className="flex flex-wrap items-center gap-3 mb-6 text-sm">
        <span className="px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/25 text-xs">
          {source.source_type}
        </span>
        <span className="text-[--text-muted]">{formatRelativeDate(source.created_at)}</span>
        <a
          href={source.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-amber-400 hover:text-amber-300 underline underline-offset-2 truncate max-w-xs"
        >
          {NL.sourceUrl} ↗
        </a>
      </div>

      {/* Tags */}
      {source.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {source.tags.map((tag) => (
            <span key={tag} className="px-2 py-0.5 text-xs rounded-full bg-sky-500/15 text-sky-400 border border-sky-500/25">
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Content */}
      <div className="bg-[#131920] border border-[#2a3441] rounded-xl p-6">
        <h2 className="text-sm font-medium text-[--text-muted] mb-4">{NL.contentPreview}</h2>
        <div className="prose prose-invert max-w-none text-[--text-secondary] whitespace-pre-wrap leading-relaxed">
          {source.raw_content}
        </div>
      </div>

      {/* Delete */}
      <div className="mt-8 flex justify-end">
        <button
          onClick={handleDelete}
          disabled={deleting}
          className={`px-4 py-2 text-sm rounded-lg transition-all ${
            confirming
              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 hover:bg-rose-500/30'
              : 'text-[--text-muted] hover:text-rose-400 hover:bg-rose-500/10'
          }`}
        >
          {deleting ? 'Verwijderen...' : confirming ? NL.confirmDelete : NL.deleteSource}
        </button>
      </div>
    </div>
  );
}
