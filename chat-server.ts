import crypto from "crypto";
import dotenv from "dotenv";
dotenv.config();

import { createServer } from "http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { prisma } from "./src/lib/prisma";
import { evaluateChatGate } from "./src/lib/match-chat-rules";
import { expireStaleMatches } from "./src/lib/expire-matches";

/** Strip quotes/whitespace — Railway UI often saves `"secret"` with quotes */
function normalizeSecret(raw: string | undefined, fallback: string) {
  if (!raw) return fallback;
  let s = String(raw).trim();
  if (
    (s.startsWith('"') && s.endsWith('"')) ||
    (s.startsWith("'") && s.endsWith("'"))
  ) {
    s = s.slice(1, -1).trim();
  }
  return s || fallback;
}

const JWT_SECRET = normalizeSecret(process.env.JWT_SECRET, "dev-secret-key");
const INTERNAL_SECRET = normalizeSecret(
  process.env.CHAT_INTERNAL_SECRET || process.env.JWT_SECRET,
  "dev-secret-key"
);

const jwtFingerprint = crypto
  .createHash("sha256")
  .update(JWT_SECRET)
  .digest("hex")
  .slice(0, 8);

if (!process.env.JWT_SECRET) {
  console.warn("[ChatServer] JWT_SECRET not set — using insecure dev default");
} else {
  console.log(`[ChatServer] JWT_SECRET loaded (fp=${jwtFingerprint})`);
}

const ALLOWED_ORIGINS = (process.env.CORS_ORIGINS || "*")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

/** userId -> set of socket ids (multi-device) */
const onlineSockets = new Map<string, Set<string>>();

async function broadcastPresence(userId: string, isOnline: boolean, lastSeenAt?: Date | null) {
  try {
    const matches = await prisma.match.findMany({
      where: { OR: [{ user1Id: userId }, { user2Id: userId }] },
      select: { user1Id: true, user2Id: true },
    });
    const payload = {
      userId,
      isOnline,
      lastSeenAt: lastSeenAt ? lastSeenAt.toISOString() : null,
    };
    for (const m of matches) {
      const other = m.user1Id === userId ? m.user2Id : m.user1Id;
      io.to(other).emit("presence_update", payload);
    }
  } catch (err) {
    console.error("[ChatServer] broadcastPresence failed:", err);
  }
}

async function setUserOnline(userId: string) {
  const sockets = onlineSockets.get(userId) || new Set<string>();
  const wasOffline = sockets.size === 0;
  try {
    await prisma.profile.updateMany({
      where: { userId },
      data: { isOnline: true },
    });
  } catch (err) {
    console.error("[ChatServer] setUserOnline db failed:", err);
  }
  if (wasOffline) {
    await broadcastPresence(userId, true);
  }
}

async function setUserOffline(userId: string) {
  const sockets = onlineSockets.get(userId);
  if (sockets && sockets.size > 0) return; // still connected elsewhere
  const lastSeenAt = new Date();
  try {
    await prisma.profile.updateMany({
      where: { userId },
      data: { isOnline: false, lastSeenAt },
    });
  } catch (err) {
    // Fallback if lastSeenAt column not migrated yet
    try {
      await prisma.profile.updateMany({
        where: { userId },
        data: { isOnline: false },
      });
    } catch (err2) {
      console.error("[ChatServer] setUserOffline db failed:", err2);
    }
    console.warn("[ChatServer] lastSeenAt update skipped:", err);
  }
  await broadcastPresence(userId, false, lastSeenAt);
}

const server = createServer(async (req, res) => {
  if (req.method === "GET" && (req.url === "/" || req.url === "/health")) {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        ok: true,
        service: "hangora-chat",
        jwtConfigured: !!process.env.JWT_SECRET,
        jwtFp: jwtFingerprint,
      })
    );
    return;
  }

  if (req.method === "POST" && req.url === "/internal/emit") {
    const secret = req.headers["x-internal-secret"];
    if (secret !== INTERNAL_SECRET) {
      res.writeHead(401, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Unauthorized" }));
      return;
    }

    const chunks: Buffer[] = [];
    for await (const chunk of req) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    try {
      const body = JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}") as {
        event?: string;
        room?: string;
        payload?: Record<string, unknown>;
      };
      if (!body.event || !body.room) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "event and room required" }));
        return;
      }
      io.to(body.room).emit(body.event, body.payload || {});
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ ok: true }));
    } catch (err) {
      console.error("[ChatServer] /internal/emit error:", err);
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "emit failed" }));
    }
    return;
  }

  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "not found" }));
});

const io = new Server(server, {
  cors: {
    origin: ALLOWED_ORIGINS.includes("*") ? true : ALLOWED_ORIGINS,
    methods: ["GET", "POST"],
  },
});

io.use((socket, next) => {
  try {
    const token =
      (socket.handshake.auth?.token as string | undefined) ||
      (socket.handshake.headers?.authorization?.startsWith("Bearer ")
        ? socket.handshake.headers.authorization.slice(7)
        : undefined);

    if (!token) {
      return next(new Error("Unauthorized: missing token"));
    }

    const payload = jwt.verify(token, JWT_SECRET) as { userId: string; email: string };
    if (!payload?.userId) {
      return next(new Error("Unauthorized: invalid token"));
    }

    (socket.data as { userId: string }).userId = payload.userId;
    next();
  } catch (err) {
    const name = err instanceof Error ? err.name : "Error";
    console.warn(`[ChatServer] JWT verify failed (${name}) fp=${jwtFingerprint}`);
    next(new Error("Unauthorized: invalid token"));
  }
});

io.on("connection", (socket) => {
  const userId = (socket.data as { userId: string }).userId;
  console.log(`[ChatServer] Client connected: ${socket.id} user=${userId}`);
  socket.join(userId);

  if (!onlineSockets.has(userId)) onlineSockets.set(userId, new Set());
  onlineSockets.get(userId)!.add(socket.id);
  setUserOnline(userId).catch(() => undefined);

  socket.on("join_room", (room_id: string) => {
    if (!room_id || typeof room_id !== "string") return;
    socket.join(room_id);
    console.log(`[ChatServer] Client ${socket.id} joined room: ${room_id}`);
  });

  socket.on("leave_room", (room_id: string) => {
    if (!room_id || typeof room_id !== "string") return;
    socket.leave(room_id);
  });

  socket.on(
    "send_message",
    async (data: { matchId: string; senderId?: string; content: string; isGroup?: boolean }) => {
      const { matchId, content, isGroup } = data;
      const senderId = userId;

      if (!matchId || !content?.trim()) {
        console.warn("[ChatServer] Invalid send_message payload:", data);
        return;
      }

      try {
        let payload;
        if (isGroup) {
          const hangout = await prisma.hangout.findUnique({
            where: { id: matchId },
            include: { participants: { select: { userId: true } } },
          });

          if (!hangout) {
            console.warn(`[ChatServer] Hangout ${matchId} not found`);
            return;
          }

          const isCreator = hangout.creatorId === senderId;
          const isParticipant = hangout.participants.some((p) => p.userId === senderId);

          if (!isCreator && !isParticipant) {
            console.warn(`[ChatServer] User ${senderId} not in hangout ${matchId}`);
            return;
          }

          const msg = await prisma.groupMessage.create({
            data: {
              hangoutId: matchId,
              senderId,
              content,
            },
            include: {
              sender: {
                select: {
                  name: true,
                  profile: { select: { avatarUrl: true } },
                },
              },
            },
          });

          payload = {
            id: msg.id,
            text: msg.content,
            sentAt: msg.createdAt.toISOString(),
            senderId: msg.senderId,
            senderName: msg.sender.name,
            senderAvatar: msg.sender.profile?.avatarUrl || null,
            matchId: msg.hangoutId,
            isGroup: true,
            isRead: false,
          };
          io.to(matchId).emit("new_message", payload);
        } else {
          const match = await prisma.match.findFirst({
            where: {
              OR: [
                { user1Id: senderId, user2Id: matchId },
                { user1Id: matchId, user2Id: senderId },
              ],
            },
            include: {
              messages: {
                select: { senderId: true, createdAt: true },
                orderBy: { createdAt: "asc" },
              },
            },
          });

          if (!match) {
            console.warn(
              `[ChatServer] Match not found between ${senderId} and ${matchId}`
            );
            socket.emit("message_rejected", {
              matchId,
              reason: "Match not found",
            });
            return;
          }

          const otherUserId =
            match.user1Id === senderId ? match.user2Id : match.user1Id;
          const gate = evaluateChatGate({
            userId: senderId,
            matchedAt: match.matchedAt,
            messages: match.messages,
          });

          if (gate.expired) {
            await prisma.match.delete({ where: { id: match.id } });
            const removed = { matchId: otherUserId, reason: gate.reason };
            io.to(senderId).emit("match_removed", removed);
            io.to(otherUserId).emit("match_removed", removed);
            socket.emit("message_rejected", {
              matchId,
              reason: gate.reason,
              chatGate: gate,
            });
            return;
          }

          if (!gate.canSend) {
            socket.emit("message_rejected", {
              matchId,
              reason: gate.reason || "You cannot send another message yet",
              chatGate: gate,
            });
            return;
          }

          const msg = await prisma.message.create({
            data: {
              matchId: match.id,
              senderId,
              content,
            },
          });

          payload = {
            id: msg.id,
            text: msg.content,
            sentAt: msg.createdAt.toISOString(),
            senderId: msg.senderId,
            matchId,
            isGroup: false,
            isRead: false,
          };
          io.to(matchId).emit("new_message", payload);
          io.to(senderId).emit("new_message", payload);
        }
      } catch (err) {
        console.error("[ChatServer] Failed to save message:", err);
      }
    }
  );

  socket.on(
    "typing",
    (data: { matchId: string; senderId?: string; senderName: string }) => {
      const { matchId, senderName } = data;
      if (!matchId) return;
      io.to(matchId).emit("user_typing", { matchId, senderId: userId, senderName });
    }
  );

  socket.on("stop_typing", (data: { matchId: string; senderId?: string }) => {
    const { matchId } = data;
    if (!matchId) return;
    io.to(matchId).emit("user_stop_typing", { matchId, senderId: userId });
  });

  socket.on(
    "mark_read",
    async (data: { matchId: string; isGroup?: boolean }) => {
      const { matchId, isGroup } = data;
      if (!matchId || isGroup) return;

      try {
        const match = await prisma.match.findFirst({
          where: {
            OR: [
              { user1Id: userId, user2Id: matchId },
              { user1Id: matchId, user2Id: userId },
            ],
          },
        });
        if (!match) return;

        const unread = await prisma.message.findMany({
          where: {
            matchId: match.id,
            senderId: { not: userId },
            isRead: false,
          },
          select: { id: true },
        });
        if (unread.length === 0) return;

        const ids = unread.map((m) => m.id);
        await prisma.message.updateMany({
          where: { id: { in: ids } },
          data: { isRead: true },
        });

        const payload = { matchId, readerId: userId, messageIds: ids };
        io.to(matchId).emit("messages_read", payload);
        io.to(userId).emit("messages_read", payload);
      } catch (err) {
        console.error("[ChatServer] mark_read failed:", err);
      }
    }
  );

  socket.on(
    "delete_message",
    async (data: { messageId: string; matchId: string; isGroup?: boolean }) => {
      const { messageId, matchId, isGroup } = data;
      if (!messageId || !matchId) return;

      try {
        if (isGroup) {
          const existing = await prisma.groupMessage.findUnique({ where: { id: messageId } });
          if (!existing || existing.senderId !== userId) return;
          await prisma.groupMessage.update({
            where: { id: messageId },
            data: { content: "[DELETED]" },
          });
          io.to(matchId).emit("message_deleted", {
            id: messageId,
            matchId,
            senderId: userId,
            isGroup: true,
          });
        } else {
          const existing = await prisma.message.findUnique({ where: { id: messageId } });
          if (!existing || existing.senderId !== userId) return;
          await prisma.message.update({
            where: { id: messageId },
            data: { content: "[DELETED]" },
          });
          const payload = {
            id: messageId,
            matchId,
            senderId: userId,
            isGroup: false,
          };
          io.to(matchId).emit("message_deleted", payload);
          io.to(userId).emit("message_deleted", payload);
        }
      } catch (err) {
        console.error("[ChatServer] delete_message failed:", err);
      }
    }
  );

  socket.on(
    "update_message",
    async (data: {
      messageId: string;
      newContent: string;
      matchId: string;
      senderId?: string;
      isGroup?: boolean;
    }) => {
      const { messageId, newContent, matchId, isGroup } = data;
      if (!messageId || !newContent?.trim() || !matchId) return;

      try {
        if (isGroup) {
          const existing = await prisma.groupMessage.findUnique({ where: { id: messageId } });
          if (!existing || existing.senderId !== userId) return;

          const msg = await prisma.groupMessage.update({
            where: { id: messageId },
            data: { content: newContent },
          });
          io.to(matchId).emit("message_updated", {
            id: msg.id,
            text: msg.content,
            matchId: msg.hangoutId,
            senderId: userId,
            isGroup: true,
          });
        } else {
          const existing = await prisma.message.findUnique({ where: { id: messageId } });
          if (!existing || existing.senderId !== userId) return;

          const msg = await prisma.message.update({
            where: { id: messageId },
            data: { content: newContent },
          });
          const payload = {
            id: msg.id,
            text: msg.content,
            matchId,
            senderId: userId,
            isGroup: false,
          };
          io.to(matchId).emit("message_updated", payload);
          io.to(userId).emit("message_updated", payload);
        }
      } catch (err) {
        console.error("[ChatServer] Failed to update message:", err);
      }
    }
  );

  socket.on("disconnect", () => {
    console.log(`[ChatServer] Client disconnected: ${socket.id}`);
    const set = onlineSockets.get(userId);
    if (set) {
      set.delete(socket.id);
      if (set.size === 0) {
        onlineSockets.delete(userId);
        setUserOffline(userId).catch(() => undefined);
      }
    }
  });
});

const PORT = Number(process.env.PORT) || 3001;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`===============================================`);
  console.log(`Hangora Chat Server running on 0.0.0.0:${PORT}`);
  console.log(`===============================================`);
});

// Periodically purge matches with no two-way reply within 24h
setInterval(() => {
  expireStaleMatches().catch((err) =>
    console.error("[ChatServer] expireStaleMatches failed:", err)
  );
}, 15 * 60 * 1000);
