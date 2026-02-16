"use client";

import { useState, useEffect, useCallback } from "react";
import type { KBSource, SourceType } from "@/types";
import { NL } from "@/lib/constants";
import { formatRelativeDate } from "@/lib/kb-utils";
import { SaveURLModal } from "./SaveURLModal";
import { KBSourceDetail } from "./KBSourceDetail";

const SOURCE_ICONS: Record<SourceType, string> = {
  article: '📄', video: '🎬', tweet: '🐦', pdf: '📑', note: '📝',
};

const SOURCE_TYPE_COLORS: Record<SourceType, string> = {
  article: 'bg-sky-500/15 text-sky-400 border-sky-500/25',
  video: 'bg-rose-500/15 text-rose-400 border-rose-500/25',
  tweet: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/25',
  pdf: 'bg-violet-500/15 text-violet-400 border-violet-500/25',
  note: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
};

const FILTER_OPTIONS: { id: SourceType | 'all'; label: string; icon: string }[] = [
  { id: 'all', label: NL.all, icon: '🗂️' },
  { id: 'article', label: NL.article, icon: '📄' },
  { id: 'video', label: NL.video, icon: '🎬' },
  { id: 'tweet', label: NL.tweet, icon: '🐦' },
  { id: 'pdf', label: NL.pdf, icon: '📑' },
  { id: 'note', label: NL.note, icon: '📝' },
];

export function LibraryView() {
  const [sources, setSources] = useState<KBSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<SourceType | 'all'>('all');
  const [showModal, setShowModal] = useState(false);
  const [selectedSource, setSelectedSource] = useState<KBSource | null>(null);

  const loadSources = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (filter !== 'all') params.set('type', filter);
      const res = await fetch(`/api/kb?${params}`);
      const data = await res.json();
      if (Array.isArray(data)) setSources(data);
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  }, [search, filter]);

  useEffect(() => {
    loadSources();
  }, [loadSources]);

  if (selectedSource) {
    return (
      <KBSourceDetail
        source={selectedSource}
        onBack={() => setSelectedSource(null)}
        onDeleted={() => { setSelectedSource(null); loadSources(); }}
      />
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 animate-fade-in">
      <div className="p-4 space-y-3">
        {/* Search + Save */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[--text-muted]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={NL.searchLibrary}
              className="w-full pl-10 pr-4 py-2.5 bg-[#131920] border border-[#2a3441] rounded-xl text-[--text-primary] placeholder:text-[--text-muted] focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/25 transition-all"
            />
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-[#0c1117] rounded-xl font-medium hover:from-amber-400 hover:to-orange-400 transition-all shadow-lg shadow-amber-500/20"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {NL.saveUrl}
          </button>
        </div>

        {/* Filter chips */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {FILTER_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setFilter(opt.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-all border ${
                filter === opt.id
                  ? 'bg-amber-500/15 text-amber-400 border-amber-500/25'
                  : 'bg-[#131920] text-[--text-muted] border-[#2a3441] hover:text-[--text-primary] hover:border-[--text-muted]'
              }`}
            >
              <span className="text-xs">{opt.icon}</span>
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4 pt-1">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-[#131920] border border-[#2a3441] rounded-xl p-4 animate-pulse">
                <div className="h-4 w-16 bg-[#1a2129] rounded mb-3" />
                <div className="h-5 w-3/4 bg-[#1a2129] rounded mb-2" />
                <div className="h-4 w-full bg-[#1a2129] rounded mb-1" />
                <div className="h-4 w-2/3 bg-[#1a2129] rounded mb-3" />
                <div className="h-3 w-20 bg-[#1a2129] rounded" />
              </div>
            ))}
          </div>
        ) : sources.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="text-5xl mb-4">📚</div>
            <h3 className="text-lg font-medium text-[--text-primary] mb-1">{NL.emptyLibrary}</h3>
            <p className="text-[--text-muted]">{NL.emptyLibraryHint}</p>
            <button
              onClick={() => setShowModal(true)}
              className="mt-4 px-4 py-2 bg-amber-500/15 text-amber-400 rounded-lg border border-amber-500/25 hover:bg-amber-500/25 transition-all"
            >
              + {NL.saveUrl}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sources.map((source) => (
              <button
                key={source.id}
                onClick={() => setSelectedSource(source)}
                className="text-left bg-[#131920] border border-[#2a3441] rounded-xl p-4 hover:border-amber-500/30 hover:shadow-lg hover:shadow-amber-500/5 transition-all duration-200 group"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${SOURCE_TYPE_COLORS[source.source_type]}`}>
                    {SOURCE_ICONS[source.source_type]} {source.source_type}
                  </span>
                  {source.favicon_url && (
                    <img
                      src={source.favicon_url}
                      alt=""
                      className="w-4 h-4 rounded"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  )}
                </div>
                <h3 className="font-medium text-[--text-primary] line-clamp-2 mb-1.5 group-hover:text-amber-400 transition-colors">
                  {source.title}
                </h3>
                {source.summary && (
                  <p className="text-sm text-[--text-muted] line-clamp-3 mb-3">
                    {source.summary}
                  </p>
                )}
                <div className="flex items-center justify-between">
                  <div className="flex gap-1.5 flex-wrap">
                    {source.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#1a2129] text-[--text-muted] border border-[#2a3441]">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <span className="text-[10px] text-[--text-muted] whitespace-nowrap ml-2">
                    {formatRelativeDate(source.created_at)}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <SaveURLModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSaved={loadSources}
      />
    </div>
  );
}
