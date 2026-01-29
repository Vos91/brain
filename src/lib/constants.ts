import type { TaskStatus, Priority, TaskCategory, Assignee } from '@/types';

// Nederlandse vertalingen
export const NL = {
  // Tabs
  documents: 'Documenten',
  tasks: 'Taken',
  
  // Statussen
  todo: 'Te doen',
  inProgress: 'Bezig',
  complete: 'Voltooid',
  
  // Acties
  addTask: 'Taak toevoegen',
  newTask: 'Nieuwe taak',
  save: 'Opslaan',
  cancel: 'Annuleren',
  delete: 'Verwijderen',
  editTask: 'Taak bewerken',
  
  // Formulier labels
  title: 'Titel',
  description: 'Beschrijving',
  priority: 'Prioriteit',
  category: 'Categorie',
  assignee: 'Toegewezen aan',
  dueDate: 'Deadline',
  notes: 'Notities',
  status: 'Status',
  
  // Prioriteiten
  low: 'Laag',
  medium: 'Gemiddeld',
  high: 'Hoog',
  
  // Categorieën
  dev: 'Ontwikkeling',
  research: 'Onderzoek',
  admin: 'Admin',
  cron: 'Cron Jobs',
  communication: 'Communicatie',
  
  // Placeholders
  searchPlaceholder: 'Zoeken...',
  whatNeedsToBeDone: 'Wat moet er gebeuren?',
  descriptionOptional: 'Beschrijving (optioneel)',
  
  // Task states
  noTasks: 'Geen taken',
  hasNotes: 'Heeft notities',
  
  // Misc
  swipeHint: '← Swipe om te wisselen →',
  all: 'Alles',
} as const;

export const ASSIGNEES: { id: Assignee; label: string; emoji: string }[] = [
  { id: 'Arie', label: 'Arie', emoji: '🦊' },
  { id: 'Jasper', label: 'Jasper', emoji: '👨‍💻' },
];

export const CATEGORIES: { id: TaskCategory; label: string; emoji: string }[] = [
  { id: 'dev', label: NL.dev, emoji: '💻' },
  { id: 'research', label: NL.research, emoji: '🔍' },
  { id: 'admin', label: NL.admin, emoji: '📋' },
  { id: 'cron', label: NL.cron, emoji: '⏰' },
  { id: 'communication', label: NL.communication, emoji: '💬' },
];

export const PRIORITIES: { id: Priority; label: string }[] = [
  { id: 'low', label: NL.low },
  { id: 'medium', label: NL.medium },
  { id: 'high', label: NL.high },
];

export const STATUSES: { id: TaskStatus; label: string; emoji: string }[] = [
  { id: 'todo', label: NL.todo, emoji: '📝' },
  { id: 'in-progress', label: NL.inProgress, emoji: '🔄' },
  { id: 'complete', label: NL.complete, emoji: '✅' },
];

// Updated color palette - warmer tones
export const PRIORITY_COLORS: Record<Priority, string> = {
  low: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
  medium: 'bg-amber-500/15 text-amber-400 border-amber-500/25',
  high: 'bg-rose-500/15 text-rose-400 border-rose-500/25',
};

export const CATEGORY_COLORS: Record<TaskCategory, string> = {
  dev: 'bg-sky-500/15 text-sky-400 border-sky-500/25',
  research: 'bg-violet-500/15 text-violet-400 border-violet-500/25',
  admin: 'bg-slate-500/15 text-slate-400 border-slate-500/25',
  cron: 'bg-orange-500/15 text-orange-400 border-orange-500/25',
  communication: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/25',
};

export const ASSIGNEE_COLORS: Record<Assignee, string> = {
  'Arie': 'bg-orange-500/15 text-orange-400 border-orange-500/25',
  'Jasper': 'bg-indigo-500/15 text-indigo-400 border-indigo-500/25',
};
