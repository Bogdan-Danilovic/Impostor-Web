'use client';

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from './firebase';
import { Room, Player, GameMode, Category, RoomSettings } from './types';
import { generateRoomCode, generatePlayerId, selectImpostors, getImpostorCount } from './utils';
import { getRandomPrompt } from './prompts/index';

const ROOM_DEFAULTS: Omit<Room, 'code' | 'hostId' | 'players'> = {
  status: 'lobby',
  gameMode: 'sentences',
  category: 'hrana',
  impostorIds: [],
  currentPrompt: { crew: '', impostor: '' },
  settings: { impostorCount: 1, revealOnVote: true },
  votes: {},
  eliminatedId: null,
  winner: null,
  round: 1,
  createdAt: Date.now(),
};

export async function createRoom(playerName: string): Promise<{ code: string; playerId: string }> {
  const code = generateRoomCode();
  const playerId = generatePlayerId();

  const player: Player = {
    id: playerId,
    name: playerName,
    isConnected: true,
    isAlive: true,
  };

  const room: Room = {
    ...ROOM_DEFAULTS,
    code,
    hostId: playerId,
    players: [player],
    createdAt: Date.now(),
  };

  await setDoc(doc(db, 'rooms', code), room);
  return { code, playerId };
}

export async function joinRoom(
  code: string,
  playerName: string
): Promise<{ playerId: string; error?: string }> {
  const ref = doc(db, 'rooms', code);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    return { playerId: '', error: 'Soba ne postoji.' };
  }

  const room = snap.data() as Room;

  if (room.status !== 'lobby') {
    return { playerId: '', error: 'Igra je već u toku.' };
  }

  if (room.players.length >= 12) {
    return { playerId: '', error: 'Soba je puna (max 12).' };
  }

  const playerId = generatePlayerId();
  const player: Player = {
    id: playerId,
    name: playerName,
    isConnected: true,
    isAlive: true,
  };

  await updateDoc(ref, {
    players: [...room.players, player],
  });

  return { playerId };
}

export async function rejoinRoom(
  code: string,
  playerId: string
): Promise<{ success: boolean }> {
  const ref = doc(db, 'rooms', code);
  const snap = await getDoc(ref);
  if (!snap.exists()) return { success: false };

  const room = snap.data() as Room;
  const players = room.players.map((p) =>
    p.id === playerId ? { ...p, isConnected: true } : p
  );

  await updateDoc(ref, { players });
  return { success: true };
}

export function subscribeToRoom(
  code: string,
  callback: (room: Room | null) => void
): Unsubscribe {
  return onSnapshot(doc(db, 'rooms', code), (snap) => {
    callback(snap.exists() ? (snap.data() as Room) : null);
  });
}

export async function updateRoomSettings(
  code: string,
  updates: {
    gameMode?: GameMode;
    category?: Category;
    settings?: Partial<RoomSettings>;
  }
): Promise<void> {
  const ref = doc(db, 'rooms', code);

  if (updates.settings) {
    const snap = await getDoc(ref);
    if (!snap.exists()) return;
    const room = snap.data() as Room;
    await updateDoc(ref, {
      ...updates,
      settings: { ...room.settings, ...updates.settings },
    });
  } else {
    await updateDoc(ref, updates);
  }
}

export async function kickPlayer(code: string, playerId: string): Promise<void> {
  const ref = doc(db, 'rooms', code);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;

  const room = snap.data() as Room;
  const players = room.players.filter((p) => p.id !== playerId);
  await updateDoc(ref, { players });
}

export async function startGame(code: string): Promise<void> {
  const ref = doc(db, 'rooms', code);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;

  const room = snap.data() as Room;
  const playerIds = room.players.map((p) => p.id);
  const impostorCount = getImpostorCount(playerIds.length, room.settings.impostorCount);
  const impostorIds = selectImpostors(playerIds, impostorCount);
  const prompt = getRandomPrompt(room.category as Category, room.gameMode);

  const players = room.players.map((p) => ({ ...p, isAlive: true, isConnected: true }));

  await updateDoc(ref, {
    status: 'roleReveal',
    impostorIds,
    currentPrompt: prompt,
    players,
    votes: {},
    eliminatedId: null,
    winner: null,
    round: 1,
  });
}

export async function advanceToDiscussion(code: string): Promise<void> {
  await updateDoc(doc(db, 'rooms', code), { status: 'discussion' });
}

export async function advanceToVoting(code: string): Promise<void> {
  await updateDoc(doc(db, 'rooms', code), { status: 'voting', votes: {} });
}

export async function castVote(
  code: string,
  voterId: string,
  votedForId: string
): Promise<void> {
  const ref = doc(db, 'rooms', code);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;

  const room = snap.data() as Room;
  const votes = { ...room.votes, [voterId]: votedForId };
  await updateDoc(ref, { votes });
}

export async function processVotes(
  code: string,
  eliminatedId: string | null,
  winner: 'crew' | 'impostor' | null
): Promise<void> {
  const ref = doc(db, 'rooms', code);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;

  const room = snap.data() as Room;
  let players = room.players;

  if (eliminatedId) {
    players = players.map((p) =>
      p.id === eliminatedId ? { ...p, isAlive: false } : p
    );
  }

  await updateDoc(ref, {
    status: 'reveal',
    eliminatedId,
    winner,
    players,
  });
}

export async function nextRound(code: string): Promise<void> {
  const ref = doc(db, 'rooms', code);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;

  const room = snap.data() as Room;

  await updateDoc(ref, {
    status: 'discussion',
    votes: {},
    eliminatedId: null,
    round: room.round + 1,
  });
}

export async function finishGame(code: string): Promise<void> {
  await updateDoc(doc(db, 'rooms', code), { status: 'finished' });
}

export async function playAgain(code: string): Promise<void> {
  const ref = doc(db, 'rooms', code);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;

  const room = snap.data() as Room;
  const players = room.players.map((p) => ({
    ...p,
    isAlive: true,
  }));

  await updateDoc(ref, {
    status: 'lobby',
    players,
    impostorIds: [],
    currentPrompt: { crew: '', impostor: '' },
    votes: {},
    eliminatedId: null,
    winner: null,
    round: 1,
  });
}

export async function setPlayerDisconnected(
  code: string,
  playerId: string
): Promise<void> {
  const ref = doc(db, 'rooms', code);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;

  const room = snap.data() as Room;
  const players = room.players.map((p) =>
    p.id === playerId ? { ...p, isConnected: false } : p
  );

  const updates: Record<string, unknown> = { players };

  if (room.hostId === playerId) {
    const nextHost = players.find((p) => p.id !== playerId && p.isConnected);
    if (nextHost) {
      updates.hostId = nextHost.id;
    }
  }

  if (room.impostorIds.includes(playerId) && room.status !== 'lobby') {
    const remainingImpostors = room.impostorIds.filter((id) => id !== playerId);
    if (remainingImpostors.length === 0) {
      updates.status = 'finished';
      updates.winner = 'crew';
    }
  }

  await updateDoc(ref, updates);
}

export async function leaveRoom(code: string, playerId: string): Promise<void> {
  const ref = doc(db, 'rooms', code);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;

  const room = snap.data() as Room;

  if (room.status === 'lobby') {
    const players = room.players.filter((p) => p.id !== playerId);
    if (players.length === 0) return;

    const updates: Record<string, unknown> = { players };
    if (room.hostId === playerId) {
      updates.hostId = players[0].id;
    }
    await updateDoc(ref, updates);
  } else {
    await setPlayerDisconnected(code, playerId);
  }
}
