'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Room } from '@/lib/types';
import { advanceToDiscussion, shufflePrompt } from '@/lib/firestore';
import { Button } from '@/components/ui/Button';

interface Props {
  room: Room;
  playerId: string;
}

export function RoleRevealScreen({ room, playerId }: Props) {
  const [isHolding, setIsHolding] = useState(false);
  const [hasSeen, setHasSeen] = useState(false);
  const isHost = room.hostId === playerId;
  const isImpostor = room.impostorIds.includes(playerId);
  const prompt = isImpostor ? room.currentPrompt.impostor : room.currentPrompt.crew;
  const role = isImpostor ? 'Impostor' : 'Crewmate';

  const handlePointerDown = useCallback(() => {
    setIsHolding(true);
    setHasSeen(true);
  }, []);

  const handlePointerUp = useCallback(() => {
    setIsHolding(false);
  }, []);

  return (
    <div className="relative flex flex-col items-center justify-center flex-1 px-6 py-8 h-screen-safe overflow-hidden">
      {/* Ambient glow — changes color based on role when revealed */}
      <motion.div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[150px] pointer-events-none"
        animate={{
          background: isHolding
            ? isImpostor
              ? 'rgba(239, 68, 68, 0.08)'
              : 'rgba(139, 92, 246, 0.08)'
            : 'rgba(139, 92, 246, 0.03)',
        }}
        transition={{ duration: 0.6 }}
      />

      <div className="relative w-full max-w-[340px] flex flex-col items-center gap-6">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-[10px] text-slate-400 uppercase tracking-[0.2em]"
        >
          Runda {room.round}
        </motion.p>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring' as const, stiffness: 250, damping: 22 }}
          className="w-full aspect-[3/4] max-h-[440px] relative select-none touch-none"
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          <AnimatePresence mode="wait">
            {!isHolding ? (
              <motion.div
                key="back"
                initial={{ opacity: 0, rotateY: 90 }}
                animate={{ opacity: 1, rotateY: 0 }}
                exit={{ opacity: 0, rotateY: -90 }}
                transition={{ type: 'spring' as const, stiffness: 400, damping: 30 }}
                className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl bg-surface/40 border border-border"
                style={{ backfaceVisibility: 'hidden' }}
              >
                <motion.div
                  animate={{ y: [0, -6, 0] }}
                  transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
                  className="text-5xl mb-6"
                >
                  🎭
                </motion.div>
                <p className="text-[14px] font-medium text-slate-400">
                  Zadrži da vidiš
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  svoju ulogu
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="front"
                initial={{ opacity: 0, rotateY: 90 }}
                animate={{ opacity: 1, rotateY: 0 }}
                exit={{ opacity: 0, rotateY: -90 }}
                transition={{ type: 'spring' as const, stiffness: 400, damping: 30 }}
                className={`
                  absolute inset-0 flex flex-col items-center justify-center rounded-2xl p-8
                  ${isImpostor
                    ? 'bg-red-950/30 border-2 border-red-500/30 glow-danger'
                    : 'bg-violet-950/20 border-2 border-violet-500/25 glow-violet'
                  }
                `}
                style={{ backfaceVisibility: 'hidden' }}
              >
                {/* Initial flash */}
                <motion.div
                  className={`absolute inset-0 rounded-2xl ${isImpostor ? 'bg-red-500/15' : 'bg-violet-500/15'}`}
                  animate={{ opacity: [1, 0] }}
                  transition={{ duration: 0.5 }}
                />

                <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] mb-3">
                  Ti si
                </p>
                <h2 className={`text-[36px] font-bold tracking-[-0.02em] mb-8 ${isImpostor ? 'text-red-400 text-glow-danger' : 'text-violet-400 text-glow'}`}>
                  {role}
                </h2>
                <div className="w-16 h-px bg-gradient-to-r from-transparent via-slate-600/50 to-transparent mb-8" />
                <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] mb-2">
                  {room.gameMode === 'sentences' ? 'Tvoje pitanje' : 'Tvoj pojam'}
                </p>
                <p className="text-[15px] text-center text-slate-200 font-medium leading-relaxed max-w-[260px]">
                  {prompt}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {hasSeen && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-1"
          >
            <p className="text-[11px] text-slate-400">Zapamti svoju ulogu i pitanje</p>
            <p className="text-[10px] text-slate-500">🔒 Ne pravi screenshot</p>
          </motion.div>
        )}

        {isHost && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="w-full flex flex-col gap-2"
          >
            <Button fullWidth onClick={() => advanceToDiscussion(room.code)}>
              Svi su videli → Diskusija
            </Button>
            <Button variant="ghost" fullWidth onClick={() => shufflePrompt(room.code)}>
              Zameni pitanje
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
