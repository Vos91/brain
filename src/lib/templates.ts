import type { Priority, TaskCategory, Assignee } from "@/types";

export interface TaskTemplate {
  id: string;
  name: string;
  emoji: string;
  title: string;
  description: string;
  priority: Priority;
  category: TaskCategory;
  assignee: Assignee | null;
}

export const TASK_TEMPLATES: TaskTemplate[] = [
  {
    id: "bug-fix",
    name: "Bug fix",
    emoji: "🐛",
    title: "Fix: ",
    description: "**Probleem:**\n\n**Stappen:**\n- \n\n**Verwacht:**\n\n**Werkelijk:**",
    priority: "high",
    category: "dev",
    assignee: null,
  },
  {
    id: "feature",
    name: "Feature",
    emoji: "✨",
    title: "",
    description: "**Doel:**\n\n**Acceptatiecriteria:**\n- \n\n**Technische notities:**",
    priority: "medium",
    category: "dev",
    assignee: null,
  },
  {
    id: "research",
    name: "Onderzoek",
    emoji: "🔬",
    title: "Research: ",
    description: "**Vraag:**\n\n**Bronnen:**\n- \n\n**Conclusie:**",
    priority: "medium",
    category: "research",
    assignee: null,
  },
  {
    id: "weekly-review",
    name: "Weekly review",
    emoji: "📋",
    title: "Weekly review",
    description: "- [ ] Open taken reviewen\n- [ ] Voltooide taken archiveren\n- [ ] Prioriteiten bijstellen\n- [ ] Volgende week plannen",
    priority: "medium",
    category: "admin",
    assignee: null,
  },
  {
    id: "deploy",
    name: "Deploy",
    emoji: "🚀",
    title: "Deploy: ",
    description: "**Project:**\n\n**Checklist:**\n- [ ] Build succesvol\n- [ ] Tests groen\n- [ ] Env vars gecheckt\n- [ ] Backup gemaakt",
    priority: "high",
    category: "dev",
    assignee: null,
  },
];
