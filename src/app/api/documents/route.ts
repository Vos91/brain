import { NextResponse } from "next/server";
import { getAllDocuments } from "@/lib/documents";

export const dynamic = "force-dynamic";

export async function GET() {
  const documents = getAllDocuments();
  return NextResponse.json(documents);
}
