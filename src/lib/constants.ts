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
  archived: 'Gearchiveerd',
  
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

  // Knowledge Base / Library
  library: 'Bibliotheek',
  saveUrl: 'URL opslaan',
  searchLibrary: 'Zoek in bibliotheek...',
  emptyLibrary: 'Je bibliotheek is nog leeg',
  emptyLibraryHint: 'Sla je eerste artikel op!',
  article: 'Artikel',
  video: 'Video',
  tweet: 'Tweet',
  pdf: 'PDF',
  note: 'Notitie',
  savedAgo: 'geleden opgeslagen',
  deleteSource: 'Bron verwijderen',
  confirmDelete: 'Weet je het zeker?',
  contentPreview: 'Inhoud',
  sourceUrl: 'Bron URL',
  
  // Sortering
  sortDefault: 'Standaard',
  sortPriority: 'Prioriteit',
  sortDueDate: 'Deadline',
  sortNewest: 'Nieuwste eerst',
  sortLabel: 'Sorteren',

  // Archivering
  archive: 'Archiveren',
  archiveAll: 'Archiveer voltooide',
  showMore: 'Toon meer',
  showLess: 'Toon minder',
  restore: 'Herstellen',
  showArchived: 'Toon archief',
  hideArchived: 'Verberg archief',

  // Dupliceren
  duplicate: 'Dupliceren',
  duplicated: 'Taak gedupliceerd',

  // Templates
  templates: 'Sjablonen',
  useTemplate: 'Gebruik sjabloon',

  // Undo
  undoArchive: 'Ongedaan maken',
  taskArchived: 'Taak gearchiveerd',

  // Unsaved changes
  unsavedChanges: 'Je hebt onopgeslagen wijzigingen. Sluiten zonder opslaan?',

  // Stale task indicator
  staleTaskTooltip: 'Niet bijgewerkt in {days} dagen',

  // Quick move
  moveToInProgress: 'Verplaats naar bezig',
  moveToTodo: 'Verplaats naar te doen',
  moveToComplete: 'Verplaats naar voltooid',

  // Weekly stats
  completedThisWeek: 'deze week voltooid',

  // Productivity streak
  dayStreak: 'dagen streak',
  oneDayStreak: '1 dag streak',

  // Today/Tomorrow focus
  dueToday: 'vandaag',
  dueTomorrow: 'morgen',

  // Average completion time
  avgCompletionTime: 'gem. doorlooptijd',
  days: 'dagen',
  oneDay: '1 dag',
  lessThanADay: '<1 dag',

  // Column quick add
  quickAdd: 'Snel toevoegen',

  // Relative time
  justNow: 'Zojuist',
  minutesAgo: 'minuten geleden',
  oneMinuteAgo: '1 minuut geleden',
  hoursAgo: 'uur geleden',
  oneHourAgo: '1 uur geleden',
  daysAgo: 'dagen geleden',
  oneDayAgo: '1 dag geleden',
  weeksAgo: 'weken geleden',
  oneWeekAgo: '1 week geleden',

  // Pomodoro
  focus: 'Focus',
  pause: 'Pauze',
  start: 'Start',
  pauseTimer: 'Pauzeer',
  reset: 'Reset',
  pomodoroTitle: 'Pomodoro Timer',

  // Deadline notifications
  deadlineToday: '⏰ Deadline vandaag',

  // Activity log
  recentChanges: 'Recente wijzigingen',
  inColumn: 'in',
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

// Tag colors with full palette
import type { TagColor } from '@/types';

export const TAG_COLORS: { id: TagColor; label: string; class: string }[] = [
  { id: 'red', label: 'Rood', class: 'bg-red-500/20 text-red-400 border-red-500/30' },
  { id: 'orange', label: 'Oranje', class: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
  { id: 'amber', label: 'Amber', class: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
  { id: 'yellow', label: 'Geel', class: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  { id: 'lime', label: 'Limoen', class: 'bg-lime-500/20 text-lime-400 border-lime-500/30' },
  { id: 'green', label: 'Groen', class: 'bg-green-500/20 text-green-400 border-green-500/30' },
  { id: 'emerald', label: 'Smaragd', class: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  { id: 'teal', label: 'Teal', class: 'bg-teal-500/20 text-teal-400 border-teal-500/30' },
  { id: 'cyan', label: 'Cyaan', class: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' },
  { id: 'sky', label: 'Hemelsblauw', class: 'bg-sky-500/20 text-sky-400 border-sky-500/30' },
  { id: 'blue', label: 'Blauw', class: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  { id: 'indigo', label: 'Indigo', class: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' },
  { id: 'violet', label: 'Violet', class: 'bg-violet-500/20 text-violet-400 border-violet-500/30' },
  { id: 'purple', label: 'Paars', class: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
  { id: 'fuchsia', label: 'Fuchsia', class: 'bg-fuchsia-500/20 text-fuchsia-400 border-fuchsia-500/30' },
  { id: 'pink', label: 'Roze', class: 'bg-pink-500/20 text-pink-400 border-pink-500/30' },
  { id: 'rose', label: 'Rozé', class: 'bg-rose-500/20 text-rose-400 border-rose-500/30' },
  { id: 'slate', label: 'Grijs', class: 'bg-slate-500/20 text-slate-400 border-slate-500/30' },
];

export const getTagColorClass = (color: TagColor): string => {
  return TAG_COLORS.find(c => c.id === color)?.class || TAG_COLORS[0].class;
};
