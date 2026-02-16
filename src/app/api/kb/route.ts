import { NextRequest, NextResponse } from "next/server";
import { fetchKBSources, saveKBSource, detectSourceType, stripHtml, extractTitle, generateSummary, hashContent } from "@/lib/kb-api";
import type { SourceType } from "@/types";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const search = request.nextUrl.searchParams.get('search') || undefined;
    const sourceType = request.nextUrl.searchParams.get('type') as SourceType | null;
    const sources = await fetchKBSources({ search, sourceType });
    return NextResponse.json(sources);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, tags = [] } = body as { url: string; tags?: string[] };

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    const sourceType = detectSourceType(url);

    // Fetch content
    let html = '';
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);
      const res = await fetch(url, {
        signal: controller.signal,
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; 2ndBrain/1.0)' },
      });
      clearTimeout(timeout);
      html = await res.text();
    } catch {
      html = `Could not fetch content from ${url}`;
    }

    const plainText = stripHtml(html);
    const title = extractTitle(html, plainText);
    const summary = generateSummary(plainText);
    const contentHash = await hashContent(plainText);

    // Try to extract favicon
    let faviconUrl: string | null = null;
    try {
      const urlObj = new URL(url);
      faviconUrl = `${urlObj.origin}/favicon.ico`;
    } catch { /* ignore */ }

    const source = await saveKBSource({
      url,
      title,
      source_type: sourceType,
      summary,
      raw_content: plainText.slice(0, 50000), // limit content size
      content_hash: contentHash,
      tags,
      favicon_url: faviconUrl,
    });

    return NextResponse.json(source, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    if (message.includes('duplicate') || message.includes('unique')) {
      return NextResponse.json({ error: 'Deze URL is al opgeslagen' }, { status: 409 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
