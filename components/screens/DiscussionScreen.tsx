'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Room } from '@/lib/types';
import { advanceToVoting, shufflePrompt } from '@/lib/firestore';
import { Button } from '@/components/ui/Button';

interface Props {
  room: Room;
  playerId: string;
}

const itemVariant = {
  hidden: { opacity: 0, y: 6 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } },
};

export function DiscussionScreen({ room, playerId }: Props) {
  const [showPrompt, setShowPrompt] = useState(false);
  const [timer, setTimer] = useState<number | null>(null);
  const [timerRunning, setTimerRunning] = useState(false);
  const isHost = room.hostId === playerId;
  const isImpostor = room.impostorIds.includes(playerId);
  const prompt = isImpostor ? room.currentPrompt.impostor : room.currentPrompt.crew;
  const alivePlayers = room.players.filter((p) => p.isAlive);

  useEffect(() => {
    if (!timerRunning || timer === null || timer <= 0) return;
    const id = setTimeout(() => setTimer((t) => (t !== null ? t - 1 : null)), 1000);
    return () => clearTimeout(id);
  }, [timerRunning, timer]);

  const toggleTimer = useCallback(() => {
    if (timer === null) { setTimer(60); setTimerRunning(true); }
    else setTimerRunning((r) => !r);
  }, [timer]);

  const fmt = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  return (
    <div className="relative flex flex-col flex-1 px-6 py-8 h-screen-safe">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[350px] h-[250px] bg-violet-600/[0.04] rounded-full blur-[100px] pointer-events-none" />

      <div className="relative w-full max-w-[380px] mx-auto flex flex-col gap-5 flex-1">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em] mb-1">Runda {room.round}</p>
          <h2 className="text-[22px] font-bold text-white tracking-[-0.02em]">Diskusija</h2>
        </motion.div>

        {/* Timer (host) */}
        {isHost && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-center gap-3">
            {timer !== null && (
              <span className={`text-[28px] font-bold tabular-nums tracking-tight ${timer <= 10 ? 'text-red-400 text-glow-danger' : 'text-white'}`}>
                {fmt(timer)}
              </span>
            )}
            <button
              onClick={toggleTimer}
              className="px-3 py-1.5 rounded-lg text-[11px] font-medium bg-surface/40 border border-border text-slate-500 hover:text-slate-300 transition-all"
            >
              {timer === null ? 'Tajmer' : timerRunning ? 'Pauza' : 'Nastavi'}
            </button>
          </motion.div>
        )}

        {/* Prompt peek */}
        <motion.button
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          onPointerDown={() => setShowPrompt(true)}
          onPointerUp={() => setShowPrompt(false)}
          onPointerLeave={() => setShowPrompt(false)}
          onPointerCancel={() => setShowPrompt(false)}
          className={`
            w-full rounded-2xl p-5 text-center touch-none select-none transition-all duration-300
            ${showPrompt
              ? isImpostor
                ? 'bg-red-950/20 border border-red-500/20 glow-danger'
                : 'bg-violet-950/15 border border-violet-500/20 glow-violet-sm'
              : 'bg-surface/30 border border-border hover:border-border-hover'
            }
          `}
        >
          {showPrompt ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.15 }}>
              <p className="text-[9px] text-slate-500 uppercase tracking-[0.2em] mb-1.5">
                {room.gameMode === 'sentences' ? 'Tvoje pitanje' : 'Tvoj pojam'}
              </p>
              <p className="text-[14px] text-slate-100 font-medium leading-relaxed">{prompt}</p>
            </motion.div>
          ) : (
            <p className="text-[13px] text-slate-400">Zadrži da pogledaš pitanje</p>
          )}
        </motion.button>

        {/* Players */}
        <div>
          <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em] mb-3">
            Igrači u igri · {alivePlayers.length}
          </p>
          <motion.div
            initial="hidden" animate="show"
            variants={{ show: { transition: { staggerChildren: 0.04 } } }}
            className="grid grid-cols-2 gap-1.5"
          >
            {alivePlayers.map((p) => (
              <motion.div
                key={p.id}
                variants={itemVariant}
                className={`
                  flex items-center gap-2 px-3 py-2.5 rounded-xl text-[12px]
                  ${p.id === playerId ? 'bg-violet-500/[0.06] border border-violet-500/15 text-violet-300' : 'bg-surface/20 border border-border text-slate-400'}
                `}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${p.isConnected ? 'bg-emerald-500' : 'bg-slate-700'}`} />
                <span className="truncate">{p.name}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>

        <p className="text-[11px] text-slate-500 text-center">
          Diskutujte o odgovorima. Ko zvuči sumnjivo?
        </p>

        {/* Host controls */}
        <div className="mt-auto pt-4 flex flex-col gap-2">
          {isHost && (
            <>
              <Button fullWidth onClick={() => advanceToVoting(room.code)}>Počni glasanje</Button>
              <Button variant="ghost" fullWidth onClick={() => shufflePrompt(room.code)}>Zameni pitanje</Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
