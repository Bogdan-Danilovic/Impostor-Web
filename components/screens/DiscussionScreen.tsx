'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Room } from '@/lib/types';
import { advanceToVoting } from '@/lib/firestore';
import { Button } from '@/components/ui/Button';

interface Props {
  room: Room;
  playerId: string;
}

export function DiscussionScreen({ room, playerId }: Props) {
  const [showPrompt, setShowPrompt] = useState(false);
  const isHost = room.hostId === playerId;
  const isImpostor = room.impostorIds.includes(playerId);
  const prompt = isImpostor ? room.currentPrompt.impostor : room.currentPrompt.crew;
  const alivePlayers = room.players.filter((p) => p.isAlive);

  async function handleAdvance() {
    await advanceToVoting(room.code);
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
          <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">
            Runda {room.round}
          </p>
          <h2 className="text-xl font-bold text-slate-100">Diskusija</h2>
        </motion.div>

        {/* Prompt peek */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onPointerDown={() => setShowPrompt(true)}
          onPointerUp={() => setShowPrompt(false)}
          onPointerLeave={() => setShowPrompt(false)}
          onPointerCancel={() => setShowPrompt(false)}
          className={`
            w-full rounded-xl p-4 text-center transition-colors duration-150 touch-none select-none
            ${showPrompt
              ? isImpostor
                ? 'bg-red-950/40 border border-red-500/30'
                : 'bg-violet-950/30 border border-violet-500/30'
              : 'bg-surface/60 border border-slate-600/30'
            }
          `}
        >
          {showPrompt ? (
            <div>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-1">
                {room.gameMode === 'sentences' ? 'Tvoje pitanje' : 'Tvoj pojam'}
              </p>
              <p className="text-sm text-slate-100 font-medium">{prompt}</p>
            </div>
          ) : (
            <p className="text-sm text-slate-500">
              Zadrži da pogledaš pitanje
            </p>
          )}
        </motion.button>

        {/* Players alive */}
        <div>
          <p className="text-xs text-slate-400 uppercase tracking-widest mb-3">
            Igrači u igri ({alivePlayers.length})
          </p>
          <div className="grid grid-cols-2 gap-2">
            {alivePlayers.map((p) => (
              <div
                key={p.id}
                className={`
                  flex items-center gap-2 px-3 py-2.5 rounded-lg
                  ${p.id === playerId
                    ? 'bg-violet-500/10 border border-violet-500/20'
                    : 'bg-surface/40 border border-slate-600/20'
                  }
                `}
              >
                <span className="text-sm">
                  {p.isConnected ? '🟢' : '⚫'}
                </span>
                <span className="text-sm text-slate-200 truncate">
                  {p.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="text-center py-2">
          <p className="text-xs text-slate-500">
            Diskutujte o svojim odgovorima. Ko zvuči sumnjivo?
          </p>
        </div>

        {/* Host advance */}
        <div className="mt-auto pt-4">
          {isHost && (
            <Button fullWidth onClick={handleAdvance}>
              Počni glasanje
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
