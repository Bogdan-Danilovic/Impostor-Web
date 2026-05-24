'use client';

import { useEffect, useState } from 'react';

interface PlayerIdentity {
  id: string | null;
  name: string | null;
}

export function usePlayer(): PlayerIdentity {
  const [identity, setIdentity] = useState<PlayerIdentity>({ id: null, name: null });

  useEffect(() => {
    setIdentity({
      id: localStorage.getItem('playerId'),
      name: localStorage.getItem('playerName'),
    });
  }, []);

  return identity;
}
