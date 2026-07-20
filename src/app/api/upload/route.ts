import { NextRequest } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join, extname } from "path";
import { success, error } from "@/lib/api-response";
import { getAuthUser, unauthorized } from "@/lib/auth";

export const dynamic = "force-dynamic";

const MAX_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
]);
const ALLOWED_EXT = new Set(["jpg", "jpeg", "png", "webp", "gif"]);

export async function POST(request: NextRequest) {
  const authUser = getAuthUser(request);
  if (!authUser) return unauthorized();

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return error("No file uploaded", 400);
    }

    if (file.size > MAX_BYTES) {
      return error("File too large (max 5MB)", 400);
    }

    const mime = (file.type || "").toLowerCase();
    if (mime && !ALLOWED_MIME.has(mime)) {
      return error("Only image uploads are allowed (jpeg, png, webp, gif)", 400);
    }

    const rawExt = (file.name.split(".").pop() || "").toLowerCase();
    const ext = ALLOWED_EXT.has(rawExt)
      ? rawExt
      : mime === "image/png"
        ? "png"
        : mime === "image/webp"
          ? "webp"
          : mime === "image/gif"
            ? "gif"
            : "jpg";

    if (!ALLOWED_EXT.has(ext)) {
      return error("Invalid file extension", 400);
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filename = `${authUser.userId}-${Date.now()}.${ext}`;

    const uploadDir = join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });

    const filePath = join(uploadDir, filename);
    // Prevent path traversal — filename is constructed server-side only
    if (extname(filePath).slice(1).toLowerCase() !== ext) {
      return error("Invalid filename", 400);
    }

    await writeFile(filePath, buffer);

    return success({
      url: `/uploads/${filename}`,
    });
  } catch (err) {
    console.error("Upload error:", err);
    return error("Failed to upload image", 500);
  }
}
