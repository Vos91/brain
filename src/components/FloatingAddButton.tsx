"use client";

interface FloatingAddButtonProps {
  onClick: () => void;
}

export function FloatingAddButton({ onClick }: FloatingAddButtonProps) {
  return (
    <button
      onClick={onClick}
      className="
        fixed bottom-6 right-6 z-50
        w-14 h-14 rounded-full
        bg-gradient-to-br from-amber-500 to-orange-600
        text-white shadow-lg shadow-amber-500/30
        flex items-center justify-center
        hover:scale-105 active:scale-95
        transition-all duration-200
        md:hidden
      "
      aria-label="Nieuwe taak toevoegen"
    >
      <svg
        className="w-7 h-7"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2.5}
          d="M12 4v16m8-8H4"
        />
      </svg>
    </button>
  );
}
