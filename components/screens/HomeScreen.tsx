'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { createRoom, joinRoom } from '@/lib/firestore';

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 26 } },
};

const shake = {
  x: [0, -8, 8, -6, 6, -3, 3, 0],
  transition: { duration: 0.4 },
};

export function HomeScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [error, setError] = useState('');
  const [errorKey, setErrorKey] = useState(0);
  const [loading, setLoading] = useState<'create' | 'join' | null>(null);

  const NAME_REGEX = /^[\p{L}\p{N} ]+$/u;
  const trimmedName = name.trim();
  const nameValid = trimmedName.length >= 2 && trimmedName.length <= 16 && NAME_REGEX.test(trimmedName);

  function showError(msg: string) {
    setError(msg);
    setErrorKey((k) => k + 1);
  }

  async function handleCreate() {
    if (!nameValid) return;
    setError('');
    setLoading('create');
    try {
      const { code, playerId } = await createRoom(trimmedName);
      localStorage.setItem('playerId', playerId);
      localStorage.setItem('playerName', trimmedName);
      router.push(`/room/${code}`);
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Greška pri kreiranju sobe.');
      setLoading(null);
    }
  }

  async function handleJoin() {
    if (!nameValid || roomCode.trim().length !== 5) return;
    setError('');
    setLoading('join');
    try {
      const code = roomCode.trim().toUpperCase();
      const { playerId, error: joinError } = await joinRoom(code, trimmedName);
      if (joinError) {
        showError(joinError);
        setLoading(null);
        return;
      }
      localStorage.setItem('playerId', playerId);
      localStorage.setItem('playerName', trimmedName);
      router.push(`/room/${code}`);
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Greška pri pridruživanju.');
      setLoading(null);
    }
  }

  return (
    <div className="relative flex flex-col items-center justify-center flex-1 px-6 h-screen-safe overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-violet-600/[0.07] rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[400px] h-[200px] bg-violet-500/[0.04] rounded-full blur-[80px] pointer-events-none" />

      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="relative w-full max-w-[340px] flex flex-col items-center gap-10"
      >
        {/* Hero */}
        <motion.div variants={fadeUp} className="text-center flex flex-col items-center pt-4">
          <motion.div
            className="text-5xl mb-5"
            animate={{ rotate: [0, -3, 3, -2, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          >
            🎭
          </motion.div>
          <h1 className="text-[42px] font-bold tracking-[-0.03em] leading-none text-glow">
            <span className="text-violet-400">IM</span>
            <span className="text-white">POSTOR</span>
          </h1>
          <p className="mt-3 text-[13px] text-slate-500 tracking-[0.08em] uppercase">
            Otkrij ko blefira
          </p>
        </motion.div>

        {/* Name */}
        <motion.div variants={fadeUp} className="w-full">
          <Input
            label="Tvoje ime"
            placeholder="Unesi ime..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={16}
            autoComplete="off"
          />
        </motion.div>

        {/* Create */}
        <motion.div variants={fadeUp} className="w-full">
          <Button
            fullWidth
            disabled={!nameValid || loading !== null}
            onClick={handleCreate}
          >
            {loading === 'create' ? (
              <motion.span
                animate={{ opacity: [1, 0.4, 1] }}
                transition={{ repeat: Infinity, duration: 1.2 }}
              >
                Kreiranje...
              </motion.span>
            ) : (
              'Napravi sobu'
            )}
          </Button>
        </motion.div>

        {/* Divider */}
        <motion.div variants={fadeUp} className="flex items-center gap-4 w-full">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-700/50 to-transparent" />
          <span className="text-[10px] text-slate-500 uppercase tracking-[0.2em]">ili</span>
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-700/50 to-transparent" />
        </motion.div>

        {/* Join */}
        <motion.div variants={fadeUp} className="w-full flex gap-3">
          <Input
            placeholder="KOD"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
            maxLength={5}
            className="text-center tracking-[0.3em] uppercase font-bold text-[15px]"
          />
          <Button
            variant="secondary"
            disabled={!nameValid || roomCode.trim().length !== 5 || loading !== null}
            onClick={handleJoin}
            className="shrink-0 px-5"
          >
            {loading === 'join' ? '...' : 'Uđi'}
          </Button>
        </motion.div>

        {/* Error */}
        {error && (
          <motion.p
            key={errorKey}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, ...shake }}
            className="text-[13px] text-red-400 text-center"
          >
            {error}
          </motion.p>
        )}
      </motion.div>
    </div>
  );
}
