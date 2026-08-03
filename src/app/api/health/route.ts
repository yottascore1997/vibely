import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { normalizeJwtSecret } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const started = Date.now();
  const secret = normalizeJwtSecret(process.env.JWT_SECRET) || "";
  const jwtFp = secret
    ? crypto.createHash("sha256").update(secret).digest("hex").slice(0, 8)
    : null;
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({
      success: true,
      message: "VibeMatch API + MySQL OK",
      db: "ok",
      jwtConfigured: !!secret,
      jwtFp,
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
        jwtConfigured: !!secret,
        jwtFp,
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
