import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { splitId, expenseId, userId } = body;

    if (!splitId && !userId && (!expenseId || !userId)) {
      return NextResponse.json({ error: "splitId, userId or (expenseId and userId) required" }, { status: 400 });
    }

    if (splitId) {
      try {
        const updatedSplit = await prisma.expenseSplit.update({
          where: { id: splitId },
          data: {
            isSettled: true,
            settledAt: new Date(),
          },
          include: {
            user: { select: { id: true, name: true } },
            expense: { select: { hangoutId: true, eventId: true, title: true } },
          },
        });

        const targetHangoutId = updatedSplit.expense.hangoutId || updatedSplit.expense.eventId;
        if (targetHangoutId) {
          try {
            const userName = updatedSplit.user?.name ? updatedSplit.user.name.split(" ")[0] : "Member";
            const groupMsgContent = `🤝 [VibeSplit] ${userName} settled balance for "${updatedSplit.expense.title}".`;
            await prisma.groupMessage.create({
              data: {
                hangoutId: targetHangoutId,
                senderId: updatedSplit.userId,
                content: groupMsgContent,
              },
            });
          } catch (chatErr) {
            console.error("Failed to post settlement chat message:", chatErr);
          }
        }

        return NextResponse.json({ success: true, updatedSplit });
      } catch (err) {
        // Fallback to userId settlement if splitId was not directly found
      }
    }

    if (userId) {
      const updated = await prisma.expenseSplit.updateMany({
        where: {
          userId,
          isSettled: false,
        },
        data: {
          isSettled: true,
          settledAt: new Date(),
        },
      });

      return NextResponse.json({ success: true, count: updated.count });
    }

    return NextResponse.json({ error: "Could not settle balance" }, { status: 400 });
  } catch (error) {
    console.error("POST /api/expenses/settle error:", error);
    return NextResponse.json({ error: "Failed to settle expense" }, { status: 500 });
  }
}
