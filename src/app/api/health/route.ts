import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const started = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({
      success: true,
      message: "VibeMatch API + MySQL OK",
      db: "ok",
      ms: Date.now() - started,
      time: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Health check DB error:", err);
    return NextResponse.json(
      {
        success: false,
        message: "API up but MySQL failed",
        db: "error",
        error: err instanceof Error ? err.message : String(err),
        ms: Date.now() - started,
        time: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 200 });
}
