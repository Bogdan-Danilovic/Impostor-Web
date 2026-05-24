const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function generateRoomCode(): string {
  let code = '';
  for (let i = 0; i < 5; i++) {
    code += CHARS[Math.floor(Math.random() * CHARS.length)];
  }
  return code;
}

export function generatePlayerId(): string {
  return crypto.randomUUID();
}

export function getImpostorCount(playerCount: number, desired: number): number {
  if (playerCount < 5) return 1;
  const max = Math.floor(playerCount / 3);
  return Math.min(desired, max);
}

export function selectImpostors(
  playerIds: string[],
  count: number
): string[] {
  const shuffled = [...playerIds].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export function tallyVotes(
  votes: Record<string, string>
): { eliminatedId: string | null; counts: Record<string, number> } {
  const counts: Record<string, number> = {};
  let maxCount = 0;
  let maxIds: string[] = [];

  for (const votedFor of Object.values(votes)) {
    if (votedFor === 'skip') continue;
    counts[votedFor] = (counts[votedFor] || 0) + 1;
    if (counts[votedFor] > maxCount) {
      maxCount = counts[votedFor];
      maxIds = [votedFor];
    } else if (counts[votedFor] === maxCount) {
      maxIds.push(votedFor);
    }
  }

  if (maxCount === 0 || maxIds.length > 1) {
    return { eliminatedId: null, counts };
  }

  return { eliminatedId: maxIds[0], counts };
}

export function checkWinCondition(
  players: { id: string; isAlive: boolean }[],
  impostorIds: string[]
): 'crew' | 'impostor' | null {
  const alive = players.filter((p) => p.isAlive);
  const aliveImpostors = alive.filter((p) => impostorIds.includes(p.id));
  const aliveCrew = alive.filter((p) => !impostorIds.includes(p.id));

  if (aliveImpostors.length === 0) return 'crew';
  if (aliveImpostors.length >= aliveCrew.length) return 'impostor';
  return null;
}
