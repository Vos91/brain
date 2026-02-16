import { NextRequest, NextResponse } from "next/server";
import { fetchKBSources } from "@/lib/kb-api";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const q = request.nextUrl.searchParams.get('q') || '';
    if (!q) {
      return NextResponse.json([]);
    }
    const sources = await fetchKBSources({ search: q });
    return NextResponse.json(sources);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
