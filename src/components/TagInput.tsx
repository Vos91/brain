"use client";

import { useState, useRef, useEffect } from "react";
import type { Tag, TagColor } from "@/types";
import { TAG_COLORS, getTagColorClass } from "@/lib/constants";

interface TagInputProps {
  tags: Tag[];
  onChange: (tags: Tag[]) => void;
  availableTags?: Tag[];
}

export function TagInput({ tags, onChange, availableTags = [] }: TagInputProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [selectedColor, setSelectedColor] = useState<TagColor>("blue");
  const [showColorPicker, setShowColorPicker] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isAdding && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isAdding]);

  const handleAddTag = () => {
    if (!newTagName.trim()) return;

    const newTag: Tag = {
      id: crypto.randomUUID(),
      name: newTagName.trim(),
      color: selectedColor,
    };

    onChange([...tags, newTag]);
    setNewTagName("");
    setIsAdding(false);
    setShowColorPicker(false);
  };

  const handleRemoveTag = (tagId: string) => {
    onChange(tags.filter((t) => t.id !== tagId));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    } else if (e.key === "Escape") {
      setIsAdding(false);
      setNewTagName("");
      setShowColorPicker(false);
    }
  };

  // Suggestions from available tags not yet added
  const suggestions = availableTags.filter(
    (at) => !tags.some((t) => t.name.toLowerCase() === at.name.toLowerCase())
  );

  return (
    <div className="space-y-2">
      {/* Current tags */}
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <span
            key={tag.id}
            className={`
              inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border
              ${getTagColorClass(tag.color)}
            `}
          >
            {tag.name}
            <button
              onClick={() => handleRemoveTag(tag.id)}
              className="ml-0.5 hover:opacity-70 transition-opacity"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </span>
        ))}

        {/* Add button */}
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium
              bg-[var(--bg-tertiary)] border border-dashed border-[var(--border)] 
              text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:border-[var(--text-muted)]
              transition-colors"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Tag
          </button>
        )}
      </div>

      {/* Add new tag form */}
      {isAdding && (
        <div className="flex flex-col gap-2 p-3 bg-[var(--bg-tertiary)] border border-[var(--border)] rounded-lg">
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Tag naam..."
              className="flex-1 px-3 py-1.5 bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg 
                text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
            />
            <button
              onClick={() => setShowColorPicker(!showColorPicker)}
              className={`
                w-8 h-8 rounded-lg border-2 transition-all
                ${getTagColorClass(selectedColor)}
              `}
              title="Kies kleur"
            />
          </div>

          {/* Color picker */}
          {showColorPicker && (
            <div className="flex flex-wrap gap-1.5 p-2 bg-[var(--bg-primary)] rounded-lg border border-[var(--border)]">
              {TAG_COLORS.map((color) => (
                <button
                  key={color.id}
                  onClick={() => {
                    setSelectedColor(color.id);
                    setShowColorPicker(false);
                  }}
                  className={`
                    w-6 h-6 rounded-md border-2 transition-all
                    ${color.class}
                    ${selectedColor === color.id ? "ring-2 ring-white/50 scale-110" : "hover:scale-105"}
                  `}
                  title={color.label}
                />
              ))}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleAddTag}
              disabled={!newTagName.trim()}
              className="px-3 py-1.5 bg-[var(--accent)] text-white text-xs font-medium rounded-lg
                hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Toevoegen
            </button>
            <button
              onClick={() => {
                setIsAdding(false);
                setNewTagName("");
                setShowColorPicker(false);
              }}
              className="px-3 py-1.5 text-[var(--text-muted)] text-xs font-medium rounded-lg
                hover:bg-[var(--bg-primary)] transition-colors"
            >
              Annuleren
            </button>
          </div>

          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div className="pt-2 border-t border-[var(--border)]">
              <p className="text-xs text-[var(--text-muted)] mb-1.5">Bestaande tags:</p>
              <div className="flex flex-wrap gap-1.5">
                {suggestions.slice(0, 8).map((tag) => (
                  <button
                    key={tag.id}
                    onClick={() => {
                      onChange([...tags, tag]);
                      setIsAdding(false);
                      setNewTagName("");
                    }}
                    className={`
                      px-2 py-0.5 rounded text-xs font-medium border transition-all hover:scale-105
                      ${getTagColorClass(tag.color)}
                    `}
                  >
                    + {tag.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
