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
  const wasImpostor = room.eliminatedId
    ? room.impostorIds.includes(room.eliminatedId)
    : false;
  const isSingleImpostor = room.impostorIds.length === 1;

  const showRole = useMemo(() => {
    if (!room.eliminatedId) return false;
    if (isSingleImpostor) return true;
    return room.settings.revealOnVote;
  }, [room.eliminatedId, isSingleImpostor, room.settings.revealOnVote]);

  const gameOver = room.winner !== null;

  async function handleNextRound() {
    await nextRound(room.code);
  }

  async function handleFinish() {
    await finishGame(room.code);
  }

  return (
    <div className="flex flex-col items-center justify-center flex-1 px-6 py-8 h-screen-safe">
      <div className="w-full max-w-sm flex flex-col items-center gap-8">
        {/* Reveal animation */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring' as const, stiffness: 200, damping: 18, delay: 0.3 }}
          className="text-center"
        >
          {room.eliminatedId && eliminated ? (
            <>
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <p className="text-xs text-slate-400 uppercase tracking-widest mb-3">
                  Eliminisan
                </p>
                <p className="text-2xl font-bold text-slate-100 mb-4">
                  {eliminated.name}
                </p>
              </motion.div>

              {showRole && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 1.2, type: 'spring' as const, stiffness: 300, damping: 20 }}
                  className={`
                    inline-block px-6 py-3 rounded-xl text-lg font-bold
                    ${wasImpostor
                      ? 'bg-red-950/60 text-red-400 border border-red-500/40 glow-danger'
                      : 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/30'
                    }
                  `}
                >
                  {wasImpostor ? '🎭 Bio je Impostor!' : '✅ Nije bio Impostor'}
                </motion.div>
              )}

              {!showRole && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.2 }}
                  className="inline-block px-6 py-3 rounded-xl text-sm text-slate-400 bg-surface/60 border border-slate-600/30"
                >
                  Uloga ostaje tajna...
                </motion.div>
              )}
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-center"
            >
              <p className="text-4xl mb-4">🤷</p>
              <p className="text-lg font-medium text-slate-300">
                Izjednačen rezultat
              </p>
              <p className="text-sm text-slate-500 mt-1">
                Niko nije eliminisan
              </p>
            </motion.div>
          )}
        </motion.div>

        {/* Game over status */}
        {gameOver && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.8 }}
            className={`
              text-center px-8 py-4 rounded-xl
              ${room.winner === 'crew'
                ? 'bg-emerald-950/30 border border-emerald-500/20'
                : 'bg-red-950/30 border border-red-500/20'
              }
            `}
          >
            <p className="text-lg font-bold">
              {room.winner === 'crew' ? '🎉 Crewmate tim pobeđuje!' : '🎭 Impostor pobeđuje!'}
            </p>
          </motion.div>
        )}

        {/* Host controls */}
        {isHost && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2 }}
            className="w-full mt-4"
          >
            {gameOver ? (
              <Button fullWidth onClick={handleFinish}>
                Prikaži rezultate
              </Button>
            ) : (
              <Button fullWidth onClick={handleNextRound}>
                Sledeća runda
              </Button>
            )}
          </motion.div>
        )}

        {!isHost && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2 }}
            className="text-xs text-slate-500"
          >
            Čekamo host-a...
          </motion.p>
        )}
      </div>
    </div>
  );
}
