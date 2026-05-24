'use client';

import { useState, useEffect, useCallback } from 'react';
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
const MODE_LABELS: Record<GameMode, string> = { sentences: 'Rečenice', concepts: 'Pojmovi' };

export function LobbyScreen({ room, playerId }: Props) {
  const [starting, setStarting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);

  const isHost = room.hostId === playerId;
  const playerCount = room.players.length;
  const canStart = playerCount >= 3;
  const maxImpostors = Math.max(1, Math.floor(playerCount / 3));
  const showImpostorSettings = playerCount >= 5;

  useEffect(() => {
    if (countdown === null || countdown <= 0) return;
    if (countdown <= 0) { startGame(room.code); return; }
    const t = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown, room.code]);

  useEffect(() => {
    if (countdown === 0) startGame(room.code);
  }, [countdown, room.code]);

  const handleStart = useCallback(() => {
    setStarting(true);
    setCountdown(3);
  }, []);

  function copyCode() {
    navigator.clipboard.writeText(room.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="relative flex flex-col flex-1 px-6 py-8 h-screen-safe overflow-y-auto">
      {/* Ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[300px] bg-violet-600/[0.05] rounded-full blur-[100px] pointer-events-none" />

      <div className="relative w-full max-w-[380px] mx-auto flex flex-col gap-6 flex-1">
        {/* Room code */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring' as const, stiffness: 300, damping: 26 }}
          className="text-center"
        >
          <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em] mb-2">Kod sobe</p>
          <button
            onClick={copyCode}
            className="text-[32px] font-bold tracking-[0.35em] text-violet-400 text-glow hover:text-violet-300 transition-colors duration-200"
          >
            {room.code}
          </button>
          <p className="text-[10px] mt-1.5 h-4">
            <AnimatePresence mode="wait">
              {copied ? (
                <motion.span key="copied" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-emerald-400">
                  Kopirano!
                </motion.span>
              ) : (
                <motion.span key="hint" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-slate-400">
                  tapni da kopiraš
                </motion.span>
              )}
            </AnimatePresence>
          </p>
        </motion.div>

        {/* Player count + progress */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-[11px] text-slate-500 uppercase tracking-[0.15em]">
              Igrači · {playerCount}/12
            </p>
            {playerCount < 3 && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-[11px] text-amber-400/80"
              >
                još {3 - playerCount}
              </motion.p>
            )}
          </div>
          <div className="w-full h-[3px] bg-surface/40 rounded-full overflow-hidden mb-4">
            <motion.div
              className={`h-full rounded-full ${canStart ? 'bg-emerald-500/70' : 'bg-amber-500/60'}`}
              animate={{ width: `${Math.min((playerCount / 3) * 100, 100)}%` }}
              transition={{ type: 'spring' as const, stiffness: 300, damping: 25 }}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <AnimatePresence mode="popLayout">
              {room.players.map((p) => (
                <PlayerCard
                  key={p.id}
                  player={p}
                  isHost={p.id === room.hostId}
                  isSelf={p.id === playerId}
                  canKick={isHost && room.status === 'lobby'}
                  onKick={() => kickPlayer(room.code, p.id)}
                />
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Settings (host only) */}
        {isHost && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col gap-5"
          >
            {/* Mode */}
            <div>
              <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em] mb-2">Režim</p>
              <div className="grid grid-cols-2 gap-2">
                {(['sentences', 'concepts'] as GameMode[]).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => updateRoomSettings(room.code, { gameMode: mode })}
                    className={`
                      px-4 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200
                      ${room.gameMode === mode
                        ? 'bg-violet-600/90 text-white glow-violet-sm'
                        : 'bg-surface/30 text-slate-500 border border-border hover:border-border-hover hover:text-slate-400'
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
              <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em] mb-2">Kategorija</p>
              <div className="flex flex-wrap gap-1.5">
                {CATEGORY_KEYS.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => updateRoomSettings(room.code, { category: cat })}
                    className={`
                      px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all duration-200
                      ${room.category === cat
                        ? 'bg-violet-600/90 text-white glow-violet-sm'
                        : 'bg-surface/30 text-slate-500 border border-border hover:border-border-hover hover:text-slate-400'
                      }
                    `}
                  >
                    {CATEGORIES[cat].label}
                  </button>
                ))}
              </div>
            </div>

            {/* Impostor count */}
            {showImpostorSettings && (
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em] mb-2">Broj impostora</p>
                <div className="flex gap-2">
                  {Array.from({ length: maxImpostors }, (_, i) => i + 1).map((n) => (
                    <button
                      key={n}
                      onClick={() => updateRoomSettings(room.code, { settings: { impostorCount: n } })}
                      className={`
                        w-10 h-10 rounded-xl text-[13px] font-bold transition-all duration-200
                        ${room.settings.impostorCount === n
                          ? 'bg-violet-600/90 text-white glow-violet-sm'
                          : 'bg-surface/30 text-slate-500 border border-border hover:border-border-hover'
                        }
                      `}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Reveal toggle */}
            {showImpostorSettings && room.settings.impostorCount > 1 && (
              <button
                onClick={() => updateRoomSettings(room.code, { settings: { revealOnVote: !room.settings.revealOnVote } })}
                className="flex items-center justify-between px-4 py-3 rounded-xl bg-surface/30 border border-border"
              >
                <span className="text-[13px] text-slate-400">Otkrij ulogu pri glasanju</span>
                <div className={`w-9 h-5 rounded-full transition-colors duration-200 relative ${room.settings.revealOnVote ? 'bg-violet-600' : 'bg-slate-700'}`}>
                  <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform duration-200 ${room.settings.revealOnVote ? 'translate-x-[18px]' : 'translate-x-0.5'}`} />
                </div>
              </button>
            )}
          </motion.div>
        )}

        {!isHost && (
          <div className="text-center py-6">
            <motion.p
              animate={{ opacity: [0.4, 0.8, 0.4] }}
              transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
              className="text-[13px] text-slate-400"
            >
              Čekamo da host započne igru...
            </motion.p>
          </div>
        )}

        {/* Start */}
        <div className="mt-auto pt-4">
          {isHost && (
            <Button fullWidth disabled={!canStart || starting} onClick={handleStart}>
              {starting ? 'Pokretanje...' : canStart ? 'Započni igru' : `Još ${3 - playerCount} igrača`}
            </Button>
          )}
        </div>
      </div>

      {/* Countdown overlay */}
      <AnimatePresence>
        {countdown !== null && countdown > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-bg/90 backdrop-blur-sm"
          >
            <motion.span
              key={countdown}
              initial={{ scale: 3, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ type: 'spring' as const, stiffness: 250, damping: 18 }}
              className="text-[120px] font-bold text-violet-400 text-glow leading-none"
            >
              {countdown}
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
