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

export type Category = "concepts" | "journal" | "projects";
