'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Room } from '@/lib/types';
import { castVote, processVotes } from '@/lib/firestore';
import { tallyVotes, checkWinCondition } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

interface Props {
  room: Room;
  playerId: string;
}

const itemVariant = {
  hidden: { opacity: 0, x: -10 },
  show: { opacity: 1, x: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } },
};

export function VotingScreen({ room, playerId }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [processing, setProcessing] = useState(false);

  const isHost = room.hostId === playerId;
  const isAlive = room.players.find((p) => p.id === playerId)?.isAlive ?? false;
  const alivePlayers = room.players.filter((p) => p.isAlive);
  const votablePlayers = alivePlayers.filter((p) => p.id !== playerId);
  const totalAlive = alivePlayers.length;
  const totalVoted = Object.keys(room.votes).length;
  const allVoted = totalVoted >= totalAlive;

  useEffect(() => {
    if (playerId in room.votes) setHasVoted(true);
  }, [playerId, room.votes]);

  async function handleVote(votedForId: string) {
    if (hasVoted || !isAlive) return;
    setSelected(votedForId);
    setHasVoted(true);
    await castVote(room.code, playerId, votedForId);
  }

  async function handleSkip() {
    if (hasVoted || !isAlive) return;
    setSelected('skip');
    setHasVoted(true);
    await castVote(room.code, playerId, 'skip');
  }

  async function handleProcess() {
    if (processing) return;
    setProcessing(true);
    const { eliminatedId } = tallyVotes(room.votes);
    const updated = eliminatedId
      ? room.players.map((p) => (p.id === eliminatedId ? { ...p, isAlive: false } : p))
      : room.players;
    const winner = eliminatedId ? checkWinCondition(updated, room.impostorIds) : null;
    await processVotes(room.code, eliminatedId, winner);
  }

  return (
    <div className="relative flex flex-col flex-1 px-6 py-8 h-screen-safe">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[350px] h-[250px] bg-violet-600/[0.04] rounded-full blur-[100px] pointer-events-none" />

      <div className="relative w-full max-w-[380px] mx-auto flex flex-col gap-5 flex-1">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <h2 className="text-[22px] font-bold text-white tracking-[-0.02em]">Glasanje</h2>
          <p className="text-[11px] text-slate-500 mt-1">{totalVoted} od {totalAlive} glasalo</p>
        </motion.div>

        {/* Progress */}
        <div className="w-full h-[3px] bg-surface/40 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-violet-500/70 rounded-full"
            animate={{ width: `${(totalVoted / totalAlive) * 100}%` }}
            transition={{ type: 'spring' as const, stiffness: 300, damping: 25 }}
          />
        </div>

        {/* Who voted */}
        <div className="flex flex-wrap gap-1.5 justify-center">
          {alivePlayers.map((p) => {
            const voted = p.id in room.votes;
            return (
              <motion.div
                key={p.id}
                animate={{ opacity: voted ? 1 : 0.4 }}
                className={`
                  px-2 py-1 rounded-lg text-[11px] transition-all duration-300
                  ${voted
                    ? 'bg-violet-500/10 text-violet-300 border border-violet-500/15'
                    : 'bg-surface/20 text-slate-400 border border-border'
                  }
                `}
              >
                {p.name}{voted ? ' ✓' : ''}
              </motion.div>
            );
          })}
        </div>

        {/* Vote options */}
        <AnimatePresence mode="wait">
          {isAlive && !hasVoted ? (
            <motion.div
              key="voting"
              initial="hidden" animate="show" exit={{ opacity: 0 }}
              variants={{ show: { transition: { staggerChildren: 0.04 } } }}
              className="flex flex-col gap-1.5"
            >
              {votablePlayers.map((p) => (
                <motion.button
                  key={p.id}
                  variants={itemVariant}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleVote(p.id)}
                  className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-left text-[13px] font-medium text-slate-300 bg-surface/25 border border-border hover:border-violet-500/25 hover:bg-surface/40 transition-all duration-200"
                >
                  {p.name}
                </motion.button>
              ))}

              <div className="h-px bg-border my-1" />

              <motion.button
                variants={itemVariant}
                whileTap={{ scale: 0.98 }}
                onClick={handleSkip}
                className="flex items-center justify-center py-3 rounded-xl text-[12px] text-slate-400 border border-dashed border-slate-700/50 hover:text-slate-400 hover:border-slate-600/50 transition-all duration-200"
              >
                Preskoči glasanje
              </motion.button>
            </motion.div>
          ) : (
            <motion.div
              key="waiting"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center flex-1 gap-3"
            >
              <motion.div
                animate={{ scale: [1, 1.08, 1] }}
                transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                className="text-3xl"
              >
                🗳️
              </motion.div>
              <p className="text-[13px] text-slate-500">
                {!isAlive ? 'Eliminisan si' : selected === 'skip' ? 'Preskočio si. Čekamo...' : 'Glasao si. Čekamo...'}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Process */}
        <AnimatePresence>
          {isHost && allVoted && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring' as const, stiffness: 300, damping: 24 }}
              className="mt-auto pt-4"
            >
              <Button fullWidth onClick={handleProcess} disabled={processing}>
                {processing ? 'Obrađujem...' : 'Otkrij rezultat'}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
