export interface Player {
  id: string;
  name: string;
  isConnected: boolean;
  isAlive: boolean;
}

export interface Prompt {
  crew: string;
  impostor: string;
}

export interface RoomSettings {
  impostorCount: number;
  revealOnVote: boolean;
}

export type RoomStatus =
  | 'lobby'
  | 'roleReveal'
  | 'discussion'
  | 'voting'
  | 'reveal'
  | 'finished';

export type GameMode = 'sentences' | 'concepts';

export type Winner = 'crew' | 'impostor' | null;

export interface Room {
  code: string;
  status: RoomStatus;
  hostId: string;
  gameMode: GameMode;
  category: Category;
  players: Player[];
  impostorIds: string[];
  currentPrompt: Prompt;
  settings: RoomSettings;
  votes: Record<string, string>;
  eliminatedId: string | null;
  winner: Winner;
  round: number;
  createdAt: number;
}

export type Category =
  | 'hrana'
  | 'filmovi'
  | 'sport'
  | 'zivotinje'
  | 'svakodnevica'
  | 'muzika'
  | 'tehnologija'
  | 'priroda'
  | 'istorija'
  | 'popkultura';

export interface PromptPair {
  crew: string;
  impostor: string;
}

export interface CategoryData {
  label: string;
  sentences: PromptPair[];
  concepts: PromptPair[];
}
