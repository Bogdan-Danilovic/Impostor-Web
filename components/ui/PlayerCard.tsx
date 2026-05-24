'use client';

import { motion } from 'framer-motion';
import { Player } from '@/lib/types';

interface Props {
  player: Player;
  isHost: boolean;
  isSelf: boolean;
  canKick: boolean;
  onKick?: () => void;
}

const AVATARS = ['🦊', '🐺', '🦉', '🐙', '🦝', '🐸', '🦋', '🐧', '🦎', '🐬', '🦅', '🐻'];

function hashName(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = ((hash << 5) - hash + name.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

export function PlayerCard({ player, isHost, isSelf, canKick, onKick }: Props) {
  const avatarIndex = hashName(player.name) % AVATARS.length;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95, y: 8 }}
      animate={{ opacity: player.isConnected ? 1 : 0.35, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: -4 }}
      transition={{ type: 'spring' as const, stiffness: 400, damping: 28 }}
      className={`
        group relative flex items-center gap-3 px-4 py-3 rounded-xl
        transition-colors duration-200
        ${isSelf
          ? 'bg-violet-500/[0.07] border border-violet-500/20'
          : 'bg-surface/30 border border-border hover:border-border-hover'
        }
      `}
    >
      <span className="text-lg shrink-0">{AVATARS[avatarIndex]}</span>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-medium text-slate-200 truncate">
            {player.name}
          </span>
          {isSelf && (
            <span className="text-[9px] text-violet-400/80 uppercase tracking-[0.15em] font-bold bg-violet-500/10 px-1.5 py-0.5 rounded">
              ti
            </span>
          )}
          {isHost && (
            <span className="text-[9px] text-amber-400/90 uppercase tracking-[0.15em] font-bold bg-amber-500/10 px-1.5 py-0.5 rounded">
              👑 host
            </span>
          )}
        </div>
        {!player.isConnected && (
          <span className="text-[10px] text-slate-400 mt-0.5 block">
            nije povezan
          </span>
        )}
      </div>

      {canKick && !isSelf && (
        <button
          onClick={onKick}
          className="flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-150 opacity-0 group-hover:opacity-100"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M3.5 3.5L10.5 10.5M10.5 3.5L3.5 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      )}
    </motion.div>
  );
}
