'use client';

import { useEffect, useState } from 'react';
import { Room } from '@/lib/types';
import { subscribeToRoom } from '@/lib/firestore';

export function useRoom(code: string) {
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToRoom(code, (data) => {
      setRoom(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [code]);

  return { room, loading };
}
