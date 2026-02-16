import { supabase } from "./supabase";
import type { KBSource, SourceType } from "@/types";

export function detectSourceType(url: string): SourceType {
  if (/youtube\.com|youtu\.be/i.test(url)) return 'video';
  if (/x\.com|twitter\.com/i.test(url)) return 'tweet';
  if (/\.pdf(\?|$)/i.test(url)) return 'pdf';
  return 'article';
}

export async function fetchKBSources(options?: {
  search?: string;
  sourceType?: SourceType | null;
}): Promise<KBSource[]> {
  if (!supabase) return [];
  
  let query = supabase
    .from('kb_sources')
    .select('*')
    .order('created_at', { ascending: false });

  if (options?.search) {
    query = query.or(`title.ilike.%${options.search}%,raw_content.ilike.%${options.search}%`);
  }
  
  if (options?.sourceType) {
    query = query.eq('source_type', options.sourceType);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data || []) as KBSource[];
}

export async function getKBSource(id: string): Promise<KBSource | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('kb_sources')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data as KBSource;
}

export async function saveKBSource(source: {
  url: string;
  title: string;
  source_type: SourceType;
  summary: string | null;
  raw_content: string;
  content_hash: string;
  tags: string[];
  favicon_url: string | null;
}): Promise<KBSource> {
  if (!supabase) throw new Error('Supabase not configured');
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('kb_sources')
    .insert({ ...source, user_id: user.id })
    .select()
    .single();
  if (error) throw error;
  return data as KBSource;
}

export async function deleteKBSource(id: string): Promise<void> {
  if (!supabase) throw new Error('Supabase not configured');
  const { error } = await supabase
    .from('kb_sources')
    .delete()
    .eq('id', id);
  if (error) throw error;
}

export async function hashContent(content: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(content);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

export function extractTitle(html: string, plainText: string): string {
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  if (titleMatch) return titleMatch[1].trim();
  const firstLine = plainText.split('\n').find(l => l.trim().length > 5);
  return firstLine?.trim().slice(0, 120) || 'Untitled';
}

export function generateSummary(text: string): string {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (clean.length <= 200) return clean;
  return clean.slice(0, 200).replace(/\s\S*$/, '') + '...';
}
