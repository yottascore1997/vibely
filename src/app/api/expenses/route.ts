import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const hangoutId = searchParams.get("hangoutId");
    const eventId = searchParams.get("eventId");
    const userId = searchParams.get("userId");

    if (!hangoutId && !eventId) {
      return NextResponse.json({ error: "hangoutId or eventId required" }, { status: 400 });
    }

    const whereClause: any = {};
    if (hangoutId) whereClause.hangoutId = hangoutId;
    if (eventId) whereClause.eventId = eventId;

    const expenses = await prisma.eventExpense.findMany({
      where: whereClause,
      include: {
        payer: {
          select: {
            id: true,
            name: true,
            profile: { select: { avatarUrl: true } },
          },
        },
        splits: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                profile: { select: { avatarUrl: true } },
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Calculate totals & balances
    let totalSpent = 0;
    const memberBalances: Record<string, { userId: string; name: string; avatarUrl: string; netBalance: number; paidTotal: number; owedTotal: number }> = {};

    for (const exp of expenses) {
      totalSpent += exp.amount;

      // Payer gets credit
      if (!memberBalances[exp.payerId]) {
        memberBalances[exp.payerId] = {
          userId: exp.payerId,
          name: exp.payer.name || "Member",
          avatarUrl: exp.payer.profile?.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100",
          netBalance: 0,
          paidTotal: 0,
          owedTotal: 0,
        };
      }
      memberBalances[exp.payerId].paidTotal += exp.amount;

      // Splits
      for (const split of exp.splits) {
        if (!memberBalances[split.userId]) {
          memberBalances[split.userId] = {
            userId: split.userId,
            name: split.user.name || "Member",
            avatarUrl: split.user.profile?.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100",
            netBalance: 0,
            paidTotal: 0,
            owedTotal: 0,
            pendingSplits: [],
          } as any;
        }
        if (!split.isSettled) {
          memberBalances[split.userId].owedTotal += split.amount;
          (memberBalances[split.userId] as any).pendingSplits.push({
            splitId: split.id,
            expenseTitle: exp.title,
            amount: split.amount,
          });
        }
      }
    }

    // Compute Net Balance for each member
    Object.values(memberBalances).forEach((m) => {
      m.netBalance = m.paidTotal - m.owedTotal;
    });

    return NextResponse.json({
      success: true,
      totalSpent,
      expenses,
      memberBalances: Object.values(memberBalances),
    });
  } catch (error) {
    console.error("GET /api/expenses error:", error);
    return NextResponse.json({ error: "Failed to fetch expenses" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { hangoutId, eventId, payerId, title, amount, category, receiptUrl, splitMemberIds } = body;

    if (!payerId || !title || !amount) {
      return NextResponse.json({ error: "payerId, title, amount are required" }, { status: 400 });
    }

    const numAmount = parseFloat(amount);
    let members: string[] = Array.isArray(splitMemberIds) && splitMemberIds.length > 0
      ? splitMemberIds
      : [];

    // Automatically fetch actual Hangout participants if not explicitly passed
    if (members.length === 0 && (hangoutId || eventId)) {
      const targetId = hangoutId || eventId;
      const hangout = await prisma.hangout.findUnique({
        where: { id: targetId },
        include: { participants: { select: { userId: true } } },
      });

      if (hangout) {
        const participantUserIds = hangout.participants.map((p) => p.userId);
        const allIds = new Set([hangout.creatorId, ...participantUserIds, payerId]);
        members = Array.from(allIds);
      }
    }

    if (members.length === 0) {
      members = [payerId];
    }

    const splitAmount = numAmount / members.length;

    const expense = await prisma.eventExpense.create({
      data: {
        hangoutId: hangoutId || null,
        eventId: eventId || null,
        payerId,
        title,
        amount: numAmount,
        category: category || "General",
        receiptUrl: receiptUrl || null,
        splits: {
          create: members.map((memId) => ({
            userId: memId,
            amount: splitAmount,
            isSettled: memId === payerId, // Payer's own split is settled automatically
            settledAt: memId === payerId ? new Date() : null,
          })),
        },
      },
      include: {
        payer: { select: { id: true, name: true } },
        splits: { include: { user: { select: { id: true, name: true } } } },
      },
    });

    // Automatically post message into Group Chat if hangoutId or eventId is linked
    const targetHangoutId = hangoutId || eventId;
    if (targetHangoutId) {
      try {
        const hangout = await prisma.hangout.findUnique({
          where: { id: targetHangoutId },
        });

        if (hangout) {
          const payerName = expense.payer?.name ? expense.payer.name.split(" ")[0] : "Someone";
          const formattedAmount = `₹${numAmount.toLocaleString("en-IN")}`;
          const perPersonAmount = `₹${Math.round(splitAmount).toLocaleString("en-IN")}`;
          const categoryEmoji = category?.includes("Food") ? "🍕" : category?.includes("Ticket") ? "🎟️" : category?.includes("Transport") ? "🚗" : "💳";

          const chatContent = `💳 [VibeSplit] ${payerName} added expense: "${title}" (${formattedAmount}) — ${perPersonAmount}/person ${categoryEmoji}`;

          await prisma.groupMessage.create({
            data: {
              hangoutId: targetHangoutId,
              senderId: payerId,
              content: chatContent,
            },
          });
        }
      } catch (chatErr) {
        console.error("Failed to post group chat message for expense:", chatErr);
      }
    }

    return NextResponse.json({ success: true, expense });
  } catch (error) {
    console.error("POST /api/expenses error:", error);
    return NextResponse.json({ error: "Failed to create expense" }, { status: 500 });
  }
}
