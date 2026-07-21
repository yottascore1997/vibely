import { NextRequest } from "next/server";
import { success, error } from "@/lib/api-response";
import { getAuthUser, unauthorized } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const auth = getAuthUser(request);
  if (!auth) return unauthorized();
  const userId = auth.userId;

  try {
    const jarItems = await prisma.jarItem.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return success(jarItems);
  } catch (err) {
    console.error("Fetch jar items error:", err);
    return error("Failed to fetch jar items", 500);
  }
}

export async function POST(request: NextRequest) {
  const auth = getAuthUser(request);
  if (!auth) return unauthorized();
  const userId = auth.userId;

  try {
    const body = await request.json();
    const { title, description, type, imageUrl, meta } = body;
    if (!title || !type) return error("title and type are required");

    const item = await prisma.jarItem.create({
      data: {
        userId,
        title,
        description: description || null,
        type,
        imageUrl: imageUrl || null,
        meta: meta || null,
      },
    });

    return success(item, 201);
  } catch (err) {
    console.error("Create jar item error:", err);
    return error("Failed to save jar item", 500);
  }
}

export async function DELETE(request: NextRequest) {
  const auth = getAuthUser(request);
  if (!auth) return unauthorized();
  const userId = auth.userId;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return error("id required");

    const existing = await prisma.jarItem.findFirst({ where: { id, userId } });
    if (!existing) return error("Item not found", 404);

    await prisma.jarItem.delete({ where: { id } });
    return success({ deleted: true });
  } catch (err) {
    console.error("Delete jar item error:", err);
    return error("Failed to delete jar item", 500);
  }
}
