'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Room, Category, GameMode } from '@/lib/types';
import { CATEGORIES } from '@/lib/prompts/index';
import { Button } from '@/components/ui/Button';
import { PlayerCard } from '@/components/ui/PlayerCard';
import { updateRoomSettings, kickPlayer, startGame } from '@/lib/firestore';

interface Props {
  room: Room;
  playerId: string;
}

const CATEGORY_KEYS = Object.keys(CATEGORIES) as Category[];

const MODE_LABELS: Record<GameMode, string> = {
  sentences: 'Rečenice',
  concepts: 'Pojmovi',
};

export function LobbyScreen({ room, playerId }: Props) {
  const [starting, setStarting] = useState(false);
  const isHost = room.hostId === playerId;
  const playerCount = room.players.length;
  const canStart = playerCount >= 3;
  const maxImpostors = Math.max(1, Math.floor(playerCount / 3));
  const showImpostorSettings = playerCount >= 5;

  async function handleModeChange(mode: GameMode) {
    await updateRoomSettings(room.code, { gameMode: mode });
  }

  async function handleCategoryChange(cat: Category) {
    await updateRoomSettings(room.code, { category: cat });
  }

  async function handleImpostorCountChange(count: number) {
    await updateRoomSettings(room.code, {
      settings: { impostorCount: count },
    });
  }

  async function handleRevealToggle() {
    await updateRoomSettings(room.code, {
      settings: { revealOnVote: !room.settings.revealOnVote },
    });
  }

  async function handleKick(kickId: string) {
    await kickPlayer(room.code, kickId);
  }

  async function handleStart() {
    setStarting(true);
    await startGame(room.code);
  }

  function copyCode() {
    navigator.clipboard.writeText(room.code);
  }

  return (
    <div className="flex flex-col flex-1 px-6 py-8 h-screen-safe overflow-y-auto">
      <div className="w-full max-w-sm mx-auto flex flex-col gap-6 flex-1">
        {/* Room code */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">
            Kod sobe
          </p>
          <button
            onClick={copyCode}
            className="text-3xl font-bold tracking-[0.3em] text-violet-400 text-glow hover:text-violet-300 transition-colors"
          >
            {room.code}
          </button>
          <p className="text-[10px] text-slate-500 mt-1">
            tapni da kopiraš
          </p>
        </motion.div>

        {/* Players */}
        <div>
          <p className="text-xs text-slate-400 uppercase tracking-widest mb-3">
            Igrači ({playerCount}/12)
          </p>
          <div className="flex flex-col gap-2">
            <AnimatePresence mode="popLayout">
              {room.players.map((p) => (
                <PlayerCard
                  key={p.id}
                  player={p}
                  isHost={p.id === room.hostId}
                  isSelf={p.id === playerId}
                  canKick={isHost && room.status === 'lobby'}
                  onKick={() => handleKick(p.id)}
                />
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Host settings */}
        {isHost && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col gap-5"
          >
            {/* Game mode */}
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-widest mb-2">
                Režim igre
              </p>
              <div className="grid grid-cols-2 gap-2">
                {(['sentences', 'concepts'] as GameMode[]).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => handleModeChange(mode)}
                    className={`
                      px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-150
                      ${room.gameMode === mode
                        ? 'bg-violet-600 text-white glow-violet-sm'
                        : 'bg-surface/60 text-slate-400 border border-slate-600/30 hover:text-slate-300'
                      }
                    `}
                  >
                    {MODE_LABELS[mode]}
                  </button>
                ))}
              </div>
            </div>

            {/* Category */}
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-widest mb-2">
                Kategorija
              </p>
              <div className="flex flex-wrap gap-2">
                {CATEGORY_KEYS.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => handleCategoryChange(cat)}
                    className={`
                      px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-150
                      ${room.category === cat
                        ? 'bg-violet-600 text-white glow-violet-sm'
                        : 'bg-surface/60 text-slate-400 border border-slate-600/30 hover:text-slate-300'
                      }
                    `}
                  >
                    {CATEGORIES[cat].label}
                  </button>
                ))}
              </div>
            </div>

            {/* Impostor count (5+ players) */}
            {showImpostorSettings && (
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-widest mb-2">
                  Broj impostora
                </p>
                <div className="flex gap-2">
                  {Array.from({ length: maxImpostors }, (_, i) => i + 1).map(
                    (n) => (
                      <button
                        key={n}
                        onClick={() => handleImpostorCountChange(n)}
                        className={`
                          w-11 h-11 rounded-xl text-sm font-bold transition-all duration-150
                          ${room.settings.impostorCount === n
                            ? 'bg-violet-600 text-white glow-violet-sm'
                            : 'bg-surface/60 text-slate-400 border border-slate-600/30 hover:text-slate-300'
                          }
                        `}
                      >
                        {n}
                      </button>
                    )
                  )}
                </div>
              </div>
            )}

            {/* Reveal toggle (multi-impostor) */}
            {showImpostorSettings && room.settings.impostorCount > 1 && (
              <button
                onClick={handleRevealToggle}
                className="flex items-center justify-between px-4 py-3 rounded-xl bg-surface/60 border border-slate-600/30"
              >
                <span className="text-sm text-slate-300">
                  Otkrij ulogu pri glasanju
                </span>
                <div
                  className={`
                    w-10 h-6 rounded-full transition-colors duration-200 relative
                    ${room.settings.revealOnVote ? 'bg-violet-600' : 'bg-slate-600'}
                  `}
                >
                  <div
                    className={`
                      absolute top-1 w-4 h-4 rounded-full bg-white transition-transform duration-200
                      ${room.settings.revealOnVote ? 'translate-x-5' : 'translate-x-1'}
                    `}
                  />
                </div>
              </button>
            )}
          </motion.div>
        )}

        {/* Non-host waiting message */}
        {!isHost && (
          <div className="text-center py-4">
            <p className="text-sm text-slate-400">
              Čekamo da host započne igru...
            </p>
          </div>
        )}

        {/* Start button */}
        <div className="mt-auto pt-4">
          {isHost ? (
            <Button
              fullWidth
              disabled={!canStart || starting}
              onClick={handleStart}
            >
              {starting
                ? 'Pokretanje...'
                : canStart
                  ? 'Započni igru'
                  : `Potrebna još ${3 - playerCount} igrača`}
            </Button>
          ) : (
            <div className="h-14" />
          )}
        </div>
      </div>
    </div>
  );
}
