export const MAX_HEARTS = 5;
export const HEART_REGEN_MS = 20 * 60 * 1000;

/** Spread duplicate timers so each heart refills 20 min after the previous one. */
function staggerRegenQueue(pending: number[]): number[] {
  if (pending.length <= 1) return pending;

  const sorted = [...pending].sort((a, b) => a - b);
  const allScheduledTogether = sorted.every((t) => t === sorted[0]);
  if (!allScheduledTogether) return sorted;

  return sorted.map((_, i) => sorted[0] + i * HEART_REGEN_MS);
}

export function scheduleHeartLoss(heartRegenAt: number[]): number[] {
  const now = Date.now();
  const pending = heartRegenAt.filter((t) => t > now);
  if (pending.length >= MAX_HEARTS) return pending;

  const nextRegenAt =
    pending.length === 0
      ? now + HEART_REGEN_MS
      : Math.max(...pending) + HEART_REGEN_MS;

  return [...pending, nextRegenAt];
}

export function reconcileHeartRegen(heartRegenAt: number[]) {
  const now = Date.now();
  const pending = staggerRegenQueue(heartRegenAt.filter((t) => t > now));
  return {
    hearts: Math.max(0, MAX_HEARTS - pending.length),
    heartRegenAt: pending,
  };
}

export function getMsUntilNextHeart(heartRegenAt: number[]): number | null {
  const now = Date.now();
  const pending = heartRegenAt.filter((t) => t > now);
  if (pending.length === 0) return null;
  return Math.min(...pending) - now;
}

export function formatHeartCountdown(ms: number): string {
  const totalSec = Math.max(0, Math.ceil(ms / 1000));
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${min}:${sec.toString().padStart(2, "0")}`;
}
