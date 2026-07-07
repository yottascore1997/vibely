import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ success: true, message: "VibeMatch API is running", time: new Date().toISOString() });
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 200 });
}
