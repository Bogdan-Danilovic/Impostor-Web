'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Room } from '@/lib/types';
import { castVote, processVotes } from '@/lib/firestore';
import { tallyVotes, checkWinCondition } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

interface Props {
  room: Room;
  playerId: string;
}

export function VotingScreen({ room, playerId }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const isHost = room.hostId === playerId;
  const isAlive = room.players.find((p) => p.id === playerId)?.isAlive ?? false;
  const alivePlayers = room.players.filter((p) => p.isAlive);
  const votablePlayersForMe = alivePlayers.filter((p) => p.id !== playerId);

  const alreadyVoted = playerId in room.votes;
  const totalAlive = alivePlayers.length;
  const totalVoted = Object.keys(room.votes).length;
  const allVoted = totalVoted >= totalAlive;

  const canProcessVotes = useMemo(() => isHost && allVoted, [isHost, allVoted]);

  useEffect(() => {
    if (alreadyVoted) setHasVoted(true);
  }, [alreadyVoted]);

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

  async function handleProcessVotes() {
    const { eliminatedId } = tallyVotes(room.votes);

    let updatedPlayers = room.players;
    if (eliminatedId) {
      updatedPlayers = room.players.map((p) =>
        p.id === eliminatedId ? { ...p, isAlive: false } : p
      );
    }

    const winner = eliminatedId
      ? checkWinCondition(updatedPlayers, room.impostorIds)
      : null;

    await processVotes(room.code, eliminatedId, winner);
  }

  return (
    <div className="flex flex-col flex-1 px-6 py-8 h-screen-safe">
      <div className="w-full max-w-sm mx-auto flex flex-col gap-6 flex-1">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h2 className="text-xl font-bold text-slate-100">Glasanje</h2>
          <p className="text-xs text-slate-400 mt-1">
            {totalVoted} od {totalAlive} glasalo
          </p>
        </motion.div>

        {/* Vote status bar */}
        <div className="w-full h-1.5 bg-surface rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-violet-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${(totalVoted / totalAlive) * 100}%` }}
            transition={{ type: 'spring' as const, stiffness: 300, damping: 25 }}
          />
        </div>

        {/* Voting grid */}
        {isAlive && !hasVoted ? (
          <div className="flex flex-col gap-2">
            {votablePlayersForMe.map((p, i) => (
              <motion.button
                key={p.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05, type: 'spring' as const, stiffness: 300, damping: 24 }}
                onClick={() => handleVote(p.id)}
                className={`
                  flex items-center gap-3 px-4 py-3.5 rounded-xl text-left transition-all duration-150
                  ${selected === p.id
                    ? 'bg-violet-600 text-white glow-violet-sm'
                    : 'bg-surface/60 border border-slate-600/30 text-slate-200 hover:border-violet-500/30'
                  }
                `}
              >
                <span className="text-sm font-medium">{p.name}</span>
              </motion.button>
            ))}

            <div className="h-px bg-slate-600/30 my-1" />

            <Button variant="ghost" fullWidth onClick={handleSkip}>
              Preskoči
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center flex-1 gap-3">
            <motion.div
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="text-3xl"
            >
              🗳️
            </motion.div>
            <p className="text-sm text-slate-400">
              {!isAlive
                ? 'Eliminisan si — ne možeš da glasaš'
                : 'Glasao si. Čekamo ostale...'}
            </p>
          </div>
        )}

        {/* Process votes button (host only, when all voted) */}
        {canProcessVotes && (
          <div className="mt-auto pt-4">
            <Button fullWidth onClick={handleProcessVotes}>
              Otkrij rezultat
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
