import dotenv from "dotenv";
dotenv.config();

import { createServer } from "http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { prisma } from "./src/lib/prisma";
import { evaluateChatGate } from "./src/lib/match-chat-rules";
import { expireStaleMatches } from "./src/lib/expire-matches";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-key";
if (!process.env.JWT_SECRET) {
  console.warn("[ChatServer] JWT_SECRET not set — using insecure dev default");
}

const ALLOWED_ORIGINS = (process.env.CORS_ORIGINS || "*")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const server = createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("Vibely Chat Server is running.\n");
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
  } catch {
    next(new Error("Unauthorized: invalid token"));
  }
});

io.on("connection", (socket) => {
  const userId = (socket.data as { userId: string }).userId;
  console.log(`[ChatServer] Client connected: ${socket.id} user=${userId}`);
  socket.join(userId);

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
          const participant = await prisma.hangoutParticipant.findFirst({
            where: { hangoutId: matchId, userId: senderId },
          });
          if (!participant) {
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
  });
});

const PORT = 3001;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`===============================================`);
  console.log(`Vibely Chat Server running on http://localhost:${PORT}`);
  console.log(`===============================================`);
});

// Periodically purge matches with no two-way reply within 24h
setInterval(() => {
  expireStaleMatches().catch((err) =>
    console.error("[ChatServer] expireStaleMatches failed:", err)
  );
}, 15 * 60 * 1000);
