'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Room } from '@/lib/types';
import { nextRound, finishGame } from '@/lib/firestore';
import { Button } from '@/components/ui/Button';

interface Props {
  room: Room;
  playerId: string;
}

export function RevealScreen({ room, playerId }: Props) {
  const isHost = room.hostId === playerId;
  const eliminated = room.players.find((p) => p.id === room.eliminatedId);
  const wasImpostor = room.eliminatedId ? room.impostorIds.includes(room.eliminatedId) : false;
  const isSingleImpostor = room.impostorIds.length === 1;
  const gameOver = room.winner !== null;

  const showRole = useMemo(() => {
    if (!room.eliminatedId) return false;
    if (isSingleImpostor) return true;
    return room.settings.revealOnVote;
  }, [room.eliminatedId, isSingleImpostor, room.settings.revealOnVote]);

  return (
    <div className="relative flex flex-col items-center justify-center flex-1 px-6 py-8 h-screen-safe overflow-hidden">
      {/* Dynamic ambient glow */}
      <motion.div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[140px] pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{
          opacity: 1,
          background: wasImpostor
            ? 'rgba(239, 68, 68, 0.06)'
            : 'rgba(139, 92, 246, 0.05)',
        }}
        transition={{ delay: 1, duration: 1.5 }}
      />

      <div className="relative w-full max-w-[340px] flex flex-col items-center gap-8">
        {room.eliminatedId && eliminated ? (
          <>
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.3, type: 'spring' as const, stiffness: 200, damping: 20 }}
              className="text-center"
            >
              <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em] mb-4">Eliminisan</p>
              <p className="text-[36px] font-bold text-white tracking-[-0.02em] leading-none">
                {eliminated.name}
              </p>
            </motion.div>

            {showRole && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 1.2, type: 'spring' as const, stiffness: 200, damping: 15 }}
                className="relative"
              >
                <motion.div
                  className={`absolute -inset-4 rounded-2xl ${wasImpostor ? 'bg-red-500/10' : 'bg-emerald-500/8'}`}
                  animate={{ opacity: [0, 0.8, 0.2], scale: [0.9, 1.05, 1] }}
                  transition={{ duration: 1, delay: 1.3 }}
                />
                <div className={`
                  relative px-8 py-5 rounded-2xl text-[18px] font-bold tracking-[-0.01em]
                  ${wasImpostor
                    ? 'bg-red-950/30 text-red-400 border border-red-500/25 glow-danger'
                    : 'bg-emerald-950/20 text-emerald-400 border border-emerald-500/20 glow-success'
                  }
                `}>
                  {wasImpostor ? '🎭 Bio je Impostor!' : '✅ Nije bio Impostor'}
                </div>
              </motion.div>
            )}

            {!showRole && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
                className="px-6 py-3 rounded-xl text-[13px] text-slate-500 bg-surface/30 border border-border"
              >
                Uloga ostaje tajna...
              </motion.div>
            )}
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, type: 'spring' as const, stiffness: 200, damping: 20 }}
            className="text-center"
          >
            <p className="text-4xl mb-4">🤷</p>
            <p className="text-[18px] font-bold text-slate-300 tracking-[-0.01em]">Izjednačen rezultat</p>
            <p className="text-[13px] text-slate-400 mt-1">Niko nije eliminisan</p>
          </motion.div>
        )}

        {gameOver && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2, type: 'spring' as const, stiffness: 300, damping: 24 }}
            className={`
              w-full text-center px-6 py-5 rounded-2xl
              ${room.winner === 'crew'
                ? 'bg-emerald-950/15 border border-emerald-500/15'
                : 'bg-red-950/15 border border-red-500/15'
              }
            `}
          >
            <p className="text-[20px] font-bold tracking-[-0.02em]">
              {room.winner === 'crew' ? '🎉 Crewmate tim pobeđuje!' : '🎭 Impostor pobeđuje!'}
            </p>
          </motion.div>
        )}

        {/* Prompts */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: gameOver ? 2.5 : 1.8 }}
          className="w-full space-y-1.5"
        >
          <p className="text-[9px] text-slate-400 uppercase tracking-[0.2em] text-center mb-2">Pitanja</p>
          <div className="px-4 py-2.5 rounded-xl bg-violet-950/10 border border-violet-500/8">
            <p className="text-[9px] text-violet-400/60 uppercase tracking-[0.15em] mb-0.5">Crewmate</p>
            <p className="text-[12px] text-slate-400">{room.currentPrompt.crew}</p>
          </div>
          <div className="px-4 py-2.5 rounded-xl bg-red-950/10 border border-red-500/8">
            <p className="text-[9px] text-red-400/60 uppercase tracking-[0.15em] mb-0.5">Impostor</p>
            <p className="text-[12px] text-slate-400">{room.currentPrompt.impostor}</p>
          </div>
        </motion.div>

        {/* Controls */}
        {isHost && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: gameOver ? 2.8 : 2.2 }}
            className="w-full"
          >
            {gameOver ? (
              <Button fullWidth onClick={() => finishGame(room.code)}>Prikaži rezultate</Button>
            ) : (
              <Button fullWidth onClick={() => nextRound(room.code)}>Sledeća runda</Button>
            )}
          </motion.div>
        )}

        {!isHost && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.2 }} className="text-[11px] text-slate-500">
            Čekamo host-a...
          </motion.p>
        )}
      </div>
    </div>
  );
}
