"use client";

import { useState, useEffect } from "react";
import { NL } from "@/lib/constants";
import { detectSourceType } from "@/lib/kb-api";
import type { SourceType } from "@/types";
import { toast } from "@/components/Toaster";

const SOURCE_ICONS: Record<SourceType, string> = {
  article: '📄',
  video: '🎬',
  tweet: '🐦',
  pdf: '📑',
  note: '📝',
};

const SOURCE_LABELS: Record<SourceType, string> = {
  article: NL.article,
  video: NL.video,
  tweet: NL.tweet,
  pdf: NL.pdf,
  note: NL.note,
};

interface SaveURLModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export function SaveURLModal({ isOpen, onClose, onSaved }: SaveURLModalProps) {
  const [url, setUrl] = useState("");
  const [tags, setTags] = useState("");
  const [saving, setSaving] = useState(false);
  const [detectedType, setDetectedType] = useState<SourceType>("article");

  useEffect(() => {
    if (url) {
      try {
        setDetectedType(detectSourceType(url));
      } catch {
        setDetectedType("article");
      }
    }
  }, [url]);

  useEffect(() => {
    if (!isOpen) {
      setUrl("");
      setTags("");
      setSaving(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!url.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/kb", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: url.trim(),
          tags: tags ? tags.split(",").map(t => t.trim()).filter(Boolean) : [],
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Opslaan mislukt");
      }
      toast.success("Bron opgeslagen!");
      onSaved();
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Opslaan mislukt";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-[#131920] border border-[#2a3441] rounded-2xl shadow-2xl animate-scale-in">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-[--text-primary] mb-4 flex items-center gap-2">
            🔗 {NL.saveUrl}
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-[--text-secondary] mb-1.5">URL</label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onPaste={(e) => {
                  const pasted = e.clipboardData.getData("text");
                  if (pasted && !url) setUrl(pasted);
                }}
                placeholder="https://..."
                className="w-full px-3 py-2.5 bg-[#0c1117] border border-[#2a3441] rounded-lg text-[--text-primary] placeholder:text-[--text-muted] focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/25 transition-all"
                autoFocus
              />
              {url && (
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/25">
                    {SOURCE_ICONS[detectedType]} {SOURCE_LABELS[detectedType]}
                  </span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm text-[--text-secondary] mb-1.5">
                Tags <span className="text-[--text-muted]">(optioneel, komma-gescheiden)</span>
              </label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="ai, onderzoek, tools"
                className="w-full px-3 py-2.5 bg-[#0c1117] border border-[#2a3441] rounded-lg text-[--text-primary] placeholder:text-[--text-muted] focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/25 transition-all"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-[--text-secondary] hover:text-[--text-primary] hover:bg-[#1a2129] rounded-lg transition-all"
            >
              {NL.cancel}
            </button>
            <button
              onClick={handleSave}
              disabled={!url.trim() || saving}
              className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-amber-500 to-orange-500 text-[#0c1117] rounded-lg hover:from-amber-400 hover:to-orange-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
            >
              {saving && (
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              )}
              {NL.save}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
