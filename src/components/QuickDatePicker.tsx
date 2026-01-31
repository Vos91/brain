"use client";

interface QuickDatePickerProps {
  value: string;
  onChange: (value: string) => void;
}

export function QuickDatePicker({ value, onChange }: QuickDatePickerProps) {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);

  const formatDate = (date: Date) => date.toISOString().split("T")[0];
  
  const quickDates = [
    { label: "Vandaag", date: formatDate(today), emoji: "📌" },
    { label: "Morgen", date: formatDate(tomorrow), emoji: "🌅" },
    { label: "+1 week", date: formatDate(nextWeek), emoji: "📆" },
  ];

  const isSelected = (date: string) => value === date;

  return (
    <div className="space-y-2">
      {/* Quick buttons */}
      <div className="flex flex-wrap gap-2">
        {quickDates.map((qd) => (
          <button
            key={qd.date}
            type="button"
            onClick={() => onChange(isSelected(qd.date) ? "" : qd.date)}
            className={`
              px-3 py-1.5 rounded-lg border text-xs font-medium transition-all
              ${isSelected(qd.date)
                ? "bg-amber-500/15 text-amber-400 border-amber-500/25"
                : "bg-[var(--bg-tertiary)] border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--text-muted)]"
              }
            `}
          >
            {qd.emoji} {qd.label}
          </button>
        ))}
      </div>

      {/* Custom date picker */}
      <div className="flex items-center gap-2">
        <input
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 px-3 py-2 bg-[var(--bg-tertiary)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] text-sm"
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="p-2 hover:bg-[var(--bg-tertiary)] rounded-lg transition-colors text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            title="Wis datum"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
