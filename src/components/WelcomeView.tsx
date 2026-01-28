"use client";

interface WelcomeViewProps {
  documentCount: number;
}

export function WelcomeView({ documentCount }: WelcomeViewProps) {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center max-w-md px-8 animate-fade-in">
        <div className="text-6xl mb-6">🧠</div>
        <h1 className="text-2xl font-bold text-[--text-primary] mb-3">
          Welkom in mijn 2nd Brain
        </h1>
        <p className="text-[--text-secondary] mb-6">
          Een verzameling van concepten, dagelijkse journals en projectnotities.
          Selecteer een document in de sidebar om te beginnen.
        </p>
        <div className="flex items-center justify-center gap-6 text-sm text-[--text-muted]">
          <div className="flex items-center gap-2">
            <span>📄</span>
            <span>{documentCount} documenten</span>
          </div>
          <div className="flex items-center gap-2">
            <span>🦊</span>
            <span>Door Arie</span>
          </div>
        </div>
      </div>
    </div>
  );
}
