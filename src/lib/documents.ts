import fs from "fs";
import path from "path";
import type { Document, DocumentMeta } from "@/types";

const DOCS_DIR = path.join(process.cwd(), "documents");

export function getCategories(): string[] {
  if (!fs.existsSync(DOCS_DIR)) return [];
  return fs.readdirSync(DOCS_DIR).filter((f) => 
    fs.statSync(path.join(DOCS_DIR, f)).isDirectory()
  );
}

export function getAllDocuments(): DocumentMeta[] {
  const categories = getCategories();
  const documents: DocumentMeta[] = [];

  for (const category of categories) {
    const categoryPath = path.join(DOCS_DIR, category);
    const files = fs.readdirSync(categoryPath).filter((f) => f.endsWith(".md"));

    for (const file of files) {
      const filePath = path.join(categoryPath, file);
      const content = fs.readFileSync(filePath, "utf-8");
      const stats = fs.statSync(filePath);
      const slug = `${category}/${file.replace(".md", "")}`;
      
      // Extract title from first h1 or filename
      const titleMatch = content.match(/^#\s+(.+)$/m);
      const title = titleMatch ? titleMatch[1] : file.replace(".md", "").replace(/-/g, " ");
      
      // Extract first paragraph as excerpt
      const excerptMatch = content.replace(/^#.+\n/, "").trim().split("\n\n")[0];
      const excerpt = excerptMatch?.slice(0, 150) || "";

      documents.push({
        slug,
        title,
        category,
        createdAt: stats.birthtime.toISOString(),
        updatedAt: stats.mtime.toISOString(),
        excerpt,
      });
    }
  }

  // Sort by updated date, newest first
  return documents.sort((a, b) => 
    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
}

export function getDocument(slug: string): Document | null {
  const [category, name] = slug.split("/");
  const filePath = path.join(DOCS_DIR, category, `${name}.md`);

  if (!fs.existsSync(filePath)) return null;

  const content = fs.readFileSync(filePath, "utf-8");
  const stats = fs.statSync(filePath);
  
  const titleMatch = content.match(/^#\s+(.+)$/m);
  const title = titleMatch ? titleMatch[1] : name.replace(/-/g, " ");
  
  const excerptMatch = content.replace(/^#.+\n/, "").trim().split("\n\n")[0];
  const excerpt = excerptMatch?.slice(0, 150) || "";

  return {
    slug,
    title,
    category,
    content,
    createdAt: stats.birthtime.toISOString(),
    updatedAt: stats.mtime.toISOString(),
    excerpt,
  };
}
