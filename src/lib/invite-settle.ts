export type SettleMove = "rock" | "paper" | "scissors";

export type SettleRound = {
  round: number;
  moves: Record<string, SettleMove | null>;
  winnerId: string | null;
  resolved: boolean;
};

export type SettleActivity = { name: string; emoji: string };

export type SettleData = {
  status: "playing" | "done";
  startedBy: string;
  scores: Record<string, number>;
  currentRound: number;
  rounds: SettleRound[];
  winnerId: string | null;
  winningActivity: SettleActivity | null;
  hangoutId?: string | null;
};

const VALID: SettleMove[] = ["rock", "paper", "scissors"];

export function isValidMove(m: unknown): m is SettleMove {
  return typeof m === "string" && VALID.includes(m as SettleMove);
}

export function parseSettleData(raw?: string | null): SettleData | null {
  if (!raw) return null;
  try {
    const d = JSON.parse(raw);
    if (!d || (d.status !== "playing" && d.status !== "done")) return null;
    return d as SettleData;
  } catch {
    return null;
  }
}

export function beats(a: SettleMove, b: SettleMove): "win" | "lose" | "draw" {
  if (a === b) return "draw";
  if (
    (a === "rock" && b === "scissors") ||
    (a === "paper" && b === "rock") ||
    (a === "scissors" && b === "paper")
  )
    return "win";
  return "lose";
}

export function createSettle(startedBy: string, playerA: string, playerB: string): SettleData {
  return {
    status: "playing",
    startedBy,
    scores: { [playerA]: 0, [playerB]: 0 },
    currentRound: 1,
    rounds: [
      {
        round: 1,
        moves: { [playerA]: null, [playerB]: null },
        winnerId: null,
        resolved: false,
      },
    ],
    winnerId: null,
    winningActivity: null,
    hangoutId: null,
  };
}

/** Hide opponent's move until the round is resolved. */
export function sanitizeSettleForUser(
  data: SettleData,
  userId: string,
  otherId: string
): SettleData & {
  myMove: SettleMove | null;
  theirMove: SettleMove | null;
  waitingForOpponent: boolean;
  myScore: number;
  theirScore: number;
} {
  const rounds = data.rounds.map((r) => {
    if (r.resolved) return r;
    return {
      ...r,
      moves: {
        [userId]: r.moves[userId] ?? null,
        [otherId]: null,
      },
    };
  });
  const cur = data.rounds.find((r) => r.round === data.currentRound) || data.rounds[data.rounds.length - 1];
  const myMove = cur?.moves?.[userId] ?? null;
  const theirRaw = cur?.moves?.[otherId] ?? null;
  const theirMove = cur?.resolved ? theirRaw : null;
  return {
    ...data,
    rounds,
    myMove,
    theirMove,
    waitingForOpponent: !!(myMove && !cur?.resolved),
    myScore: data.scores[userId] || 0,
    theirScore: data.scores[otherId] || 0,
  };
}
