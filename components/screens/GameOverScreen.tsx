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

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } } };
const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } },
};
const slideIn = {
  hidden: { opacity: 0, x: -8 },
  show: { opacity: 1, x: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } },
};

export function GameOverScreen({ room, playerId }: Props) {
  const router = useRouter();
  const isHost = room.hostId === playerId;
  const crewWon = room.winner === 'crew';
  const impostorCount = room.impostorIds.length;
  const crewCount = room.players.length - impostorCount;

  async function handleLeave() {
    await leaveRoom(room.code, playerId);
    localStorage.removeItem('playerId');
    router.push('/');
  }

  return (
    <div className="relative flex flex-col items-center justify-center flex-1 px-6 py-8 h-screen-safe overflow-y-auto">
      {/* Ambient glow */}
      <div className={`absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[400px] rounded-full blur-[140px] pointer-events-none ${crewWon ? 'bg-emerald-500/[0.04]' : 'bg-red-500/[0.04]'}`} />

      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="relative w-full max-w-[360px] flex flex-col items-center gap-5"
      >
        {/* Winner */}
        <motion.div
          variants={fadeUp}
          className={`
            w-full text-center px-6 py-8 rounded-2xl
            ${crewWon
              ? 'bg-emerald-950/15 border border-emerald-500/15'
              : 'bg-red-950/15 border border-red-500/15'
            }
          `}
        >
          <motion.p
            className="text-5xl mb-3"
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            {crewWon ? '🎉' : '🎭'}
          </motion.p>
          <h2 className="text-[24px] font-bold tracking-[-0.02em]">
            {crewWon ? 'Crewmate tim pobeđuje!' : 'Impostor pobeđuje!'}
          </h2>
        </motion.div>

        {/* Stats */}
        <motion.div variants={fadeUp} className="grid grid-cols-3 gap-2 w-full">
          {[
            { value: room.round, label: room.round === 1 ? 'runda' : 'runde' },
            { value: room.players.length, label: 'igrača' },
            { value: `${crewCount}:${impostorCount}`, label: 'crew:imp' },
          ].map((stat) => (
            <div key={stat.label} className="text-center py-3 rounded-xl bg-surface/20 border border-border">
              <p className="text-[18px] font-bold text-white">{stat.value}</p>
              <p className="text-[9px] text-slate-400 uppercase tracking-[0.15em] mt-0.5">{stat.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Roles */}
        <motion.div variants={fadeUp} className="w-full">
          <p className="text-[9px] text-slate-400 uppercase tracking-[0.2em] mb-3 text-center">Uloge</p>
          <motion.div
            initial="hidden" animate="show"
            variants={{ show: { transition: { staggerChildren: 0.05 } } }}
            className="flex flex-col gap-1.5"
          >
            {room.players.map((p) => {
              const isImp = room.impostorIds.includes(p.id);
              return (
                <motion.div
                  key={p.id}
                  variants={slideIn}
                  className={`
                    flex items-center justify-between px-4 py-3 rounded-xl
                    ${isImp ? 'bg-red-950/15 border border-red-500/12' : 'bg-surface/20 border border-border'}
                  `}
                >
                  <span className="text-[13px] font-medium text-slate-300">
                    {p.name}
                    {p.id === playerId && (
                      <span className="text-[9px] text-violet-400/70 ml-2 uppercase tracking-wider bg-violet-500/10 px-1.5 py-0.5 rounded">ti</span>
                    )}
                  </span>
                  <span className={`text-[10px] font-bold uppercase tracking-[0.12em] ${isImp ? 'text-red-400' : 'text-slate-400'}`}>
                    {isImp ? 'Impostor' : 'Crewmate'}
                  </span>
                </motion.div>
              );
            })}
          </motion.div>
        </motion.div>

        {/* Prompts */}
        <motion.div variants={fadeUp} className="w-full space-y-1.5">
          <p className="text-[9px] text-slate-400 uppercase tracking-[0.2em] mb-2 text-center">Pitanja</p>
          <div className="px-4 py-3 rounded-xl bg-violet-950/10 border border-violet-500/8">
            <p className="text-[9px] text-violet-400/60 uppercase tracking-[0.15em] mb-1">Crewmate</p>
            <p className="text-[12px] text-slate-400 leading-relaxed">{room.currentPrompt.crew}</p>
          </div>
          <div className="px-4 py-3 rounded-xl bg-red-950/10 border border-red-500/8">
            <p className="text-[9px] text-red-400/60 uppercase tracking-[0.15em] mb-1">Impostor</p>
            <p className="text-[12px] text-slate-400 leading-relaxed">{room.currentPrompt.impostor}</p>
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div variants={fadeUp} className="w-full flex flex-col gap-2 mt-2">
          {isHost ? (
            <Button fullWidth onClick={() => playAgain(room.code)}>Igraj ponovo</Button>
          ) : (
            <p className="text-[11px] text-slate-400 text-center py-2">Čekamo host-a za novu igru...</p>
          )}
          <Button variant="ghost" fullWidth onClick={handleLeave}>Napusti sobu</Button>
        </motion.div>
      </motion.div>
    </div>
  );
}
