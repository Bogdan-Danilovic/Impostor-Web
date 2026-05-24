'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Room } from '@/lib/types';
import { playAgain, leaveRoom } from '@/lib/firestore';
import { Button } from '@/components/ui/Button';

interface Props {
  room: Room;
  playerId: string;
}

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } },
};

export function GameOverScreen({ room, playerId }: Props) {
  const router = useRouter();
  const isHost = room.hostId === playerId;
  const crewWon = room.winner === 'crew';

  async function handlePlayAgain() {
    await playAgain(room.code);
  }

  async function handleLeave() {
    await leaveRoom(room.code, playerId);
    localStorage.removeItem('playerId');
    router.push('/');
  }

  return (
    <div className="flex flex-col items-center justify-center flex-1 px-6 py-8 h-screen-safe overflow-y-auto">
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="w-full max-w-sm flex flex-col items-center gap-6"
      >
        {/* Winner banner */}
        <motion.div
          variants={fadeUp}
          className={`
            text-center px-8 py-6 rounded-2xl w-full
            ${crewWon
              ? 'bg-emerald-950/30 border border-emerald-500/20'
              : 'bg-red-950/30 border border-red-500/20'
            }
          `}
        >
          <p className="text-4xl mb-3">{crewWon ? '🎉' : '🎭'}</p>
          <h2 className="text-2xl font-bold">
            {crewWon ? 'Crewmate tim pobeđuje!' : 'Impostor pobeđuje!'}
          </h2>
        </motion.div>

        {/* Roles reveal */}
        <motion.div variants={fadeUp} className="w-full">
          <p className="text-xs text-slate-400 uppercase tracking-widest mb-3 text-center">
            Uloge
          </p>
          <div className="flex flex-col gap-2">
            {room.players.map((p) => {
              const wasImpostor = room.impostorIds.includes(p.id);
              return (
                <div
                  key={p.id}
                  className={`
                    flex items-center justify-between px-4 py-3 rounded-xl
                    ${wasImpostor
                      ? 'bg-red-950/30 border border-red-500/20'
                      : 'bg-surface/40 border border-slate-600/20'
                    }
                  `}
                >
                  <span className="text-sm font-medium text-slate-200">
                    {p.name}
                    {p.id === playerId && (
                      <span className="text-[10px] text-violet-400 ml-2 uppercase">ti</span>
                    )}
                  </span>
                  <span
                    className={`text-xs font-semibold uppercase tracking-wider ${
                      wasImpostor ? 'text-red-400' : 'text-slate-500'
                    }`}
                  >
                    {wasImpostor ? 'Impostor' : 'Crewmate'}
                  </span>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Prompts reveal */}
        <motion.div variants={fadeUp} className="w-full">
          <p className="text-xs text-slate-400 uppercase tracking-widest mb-3 text-center">
            Pitanja
          </p>
          <div className="flex flex-col gap-2">
            <div className="px-4 py-3 rounded-xl bg-violet-950/20 border border-violet-500/15">
              <p className="text-[10px] text-violet-400 uppercase tracking-wider mb-1">Crewmate</p>
              <p className="text-sm text-slate-200">{room.currentPrompt.crew}</p>
            </div>
            <div className="px-4 py-3 rounded-xl bg-red-950/20 border border-red-500/15">
              <p className="text-[10px] text-red-400 uppercase tracking-wider mb-1">Impostor</p>
              <p className="text-sm text-slate-200">{room.currentPrompt.impostor}</p>
            </div>
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div variants={fadeUp} className="w-full flex flex-col gap-3 mt-2">
          {isHost ? (
            <Button fullWidth onClick={handlePlayAgain}>
              Igraj ponovo
            </Button>
          ) : (
            <p className="text-xs text-slate-500 text-center">
              Čekamo host-a za novu igru...
            </p>
          )}
          <Button variant="ghost" fullWidth onClick={handleLeave}>
            Napusti sobu
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}
