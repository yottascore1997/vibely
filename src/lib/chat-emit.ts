/**
 * Emit a Socket.IO event via the chat server's internal HTTP endpoint.
 * Used by Next.js API routes (expenses, etc.) that cannot access the Socket.IO instance.
 */
export async function emitChatEvent(
  event: string,
  room: string,
  payload: Record<string, unknown>
): Promise<void> {
  const base =
    process.env.CHAT_SERVER_URL ||
    process.env.INTERNAL_CHAT_URL ||
    "http://127.0.0.1:3001";
  const secret =
    process.env.CHAT_INTERNAL_SECRET ||
    process.env.JWT_SECRET ||
    "dev-secret-key";

  try {
    const res = await fetch(`${base.replace(/\/$/, "")}/internal/emit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-internal-secret": secret,
      },
      body: JSON.stringify({ event, room, payload }),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.warn(`[chat-emit] ${res.status} ${text}`);
    }
  } catch (err) {
    console.warn("[chat-emit] failed:", err);
  }
}
