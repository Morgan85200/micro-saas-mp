import type { CompletionRecord } from "./types";

export const ANIME_PAGE_SIZE = 200;

export const normalizeGuess = (value: string) => value.trim().toLowerCase();

export const formatQuizDate = (date: string) => {
  const [year, month, day] = date.split("-");
  if (!year || !month || !day) return date;
  return `${day}/${month}/${year}`;
};

const base64UrlDecode = (value: string) => {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(
    normalized.length + ((4 - (normalized.length % 4)) % 4),
    "="
  );
  return atob(padded);
};

export const getUserScopeFromToken = (token: string | null) => {
  if (!token) return "guest";

  try {
    const payloadPart = token.split(".")[1];
    if (!payloadPart) return "auth";
    const payload = JSON.parse(base64UrlDecode(payloadPart)) as {
      username?: string;
      sub?: string;
    };
    const identity = payload.username || payload.sub;
    return identity ? `auth-${identity}` : "auth";
  } catch {
    return "auth";
  }
};

export const buildShareText = (
  quizDate: string,
  status: "won" | "lost",
  tries: number | null
) => {
  if (status === "won") {
    return `J'ai trouve l'Animangadle du jour (${formatQuizDate(
      quizDate
    )}) en ${tries ?? "?"} essais ✅`;
  }

  return `Je n'ai pas reussi a trouver l'Animangadle du jour (${formatQuizDate(
    quizDate
  )}) ❌`;
};

export const getShareContext = (
  quizDate: string | null,
  status: "won" | "lost" | "completed" | "idle" | "ready",
  completedAttempt: CompletionRecord | null,
  currentHintIndex: number,
  hintCount: number
) => {
  if (!quizDate) return null;

  const shareStatus =
    status === "completed"
      ? completedAttempt?.status
      : status === "won" || status === "lost"
      ? status
      : null;

  if (!shareStatus) return null;

  const shareTries =
    status === "completed"
      ? completedAttempt?.hintsUsed ?? null
      : status === "won"
      ? currentHintIndex + 1
      : hintCount;

  return {
    shareStatus,
    shareTries,
    shareText: buildShareText(quizDate, shareStatus, shareTries),
  };
};
