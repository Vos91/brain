import { NextRequest, NextResponse } from "next/server";
import { getDocument } from "@/lib/documents";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  const { slug } = await params;
  const fullSlug = slug.join("/");
  const document = getDocument(fullSlug);

  if (!document) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  return NextResponse.json(document);
}
