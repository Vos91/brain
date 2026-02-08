// Document types
export interface Document {
  slug: string;
  title: string;
  category: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  excerpt: string;
}

export interface DocumentMeta {
  slug: string;
  title: string;
  category: string;
  createdAt: string;
  updatedAt: string;
  excerpt: string;
}

export type DocumentCategory = "concepts" | "journal" | "projects";

// Task types
export type TaskStatus = 'todo' | 'in-progress' | 'complete' | 'archived';

export type Priority = 'low' | 'medium' | 'high';

export type TaskCategory = 'dev' | 'research' | 'admin' | 'cron' | 'communication';

export type Assignee = 'Arie' | 'Jasper';

// Tags/Labels
export interface Tag {
  id: string;
  name: string;
  color: TagColor;
}

export type TagColor = 
  | 'red' | 'orange' | 'amber' | 'yellow' | 'lime' 
  | 'green' | 'emerald' | 'teal' | 'cyan' | 'sky' 
  | 'blue' | 'indigo' | 'violet' | 'purple' | 'fuchsia' 
  | 'pink' | 'rose' | 'slate';

// Subtasks
export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: Priority;
  category: TaskCategory;
  assignee: Assignee | null;
  notes: string;
  due_date: string | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  tags?: Tag[];
  subtasks?: Subtask[];
}

// App types
export type AppView = 'documents' | 'tasks';
