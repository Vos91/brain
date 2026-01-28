"use client";

import { useMemo } from "react";
import type { Document } from "@/types";

interface DocumentViewProps {
  document: Document;
}

export function DocumentView({ document }: DocumentViewProps) {
  const formattedDate = useMemo(() => {
    const d = new Date(document.updatedAt);
    return d.toLocaleDateString("nl-NL", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }, [document.updatedAt]);

  // Simple markdown to HTML conversion
  const htmlContent = useMemo(() => {
    let html = document.content;

    // Headers
    html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
    html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
    html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');

    // Bold and italic
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

    // Code blocks
    html = html.replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>');
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');

    // Lists
    html = html.replace(/^\- (.+)$/gm, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');

    // Numbered lists
    html = html.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');

    // Blockquotes
    html = html.replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>');

    // Horizontal rules
    html = html.replace(/^---$/gm, '<hr />');

    // Tables (basic)
    html = html.replace(/^\|(.+)\|$/gm, (match, content) => {
      const cells = content.split('|').map((c: string) => c.trim());
      const isHeader = cells.some((c: string) => c.match(/^-+$/));
      if (isHeader) return '';
      return `<tr>${cells.map((c: string) => `<td>${c}</td>`).join('')}</tr>`;
    });
    html = html.replace(/(<tr>.*<\/tr>\n?)+/g, '<table>$&</table>');

    // Paragraphs
    html = html.replace(/\n\n/g, '</p><p>');
    html = '<p>' + html + '</p>';
    html = html.replace(/<p>\s*<(h[1-3]|ul|ol|pre|blockquote|hr|table)/g, '<$1');
    html = html.replace(/<\/(h[1-3]|ul|ol|pre|blockquote|table)>\s*<\/p>/g, '</$1>');
    html = html.replace(/<p>\s*<\/p>/g, '');

    return html;
  }, [document.content]);

  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 md:px-8 py-6 md:py-12 animate-fade-in">
      {/* Meta */}
      <div className="mb-8 pb-6 border-b border-[--border]">
        <div className="flex items-center gap-2 text-sm text-[--text-muted] mb-2">
          <span className="capitalize px-2 py-0.5 bg-[--bg-tertiary] rounded">
            {document.category}
          </span>
          <span>•</span>
          <span>Bijgewerkt {formattedDate}</span>
        </div>
      </div>

      {/* Content */}
      <div
        className="markdown"
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />
    </article>
  );
}
