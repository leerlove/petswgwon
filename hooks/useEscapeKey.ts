'use client';

import { useEffect } from 'react';

export function useEscapeKey(handler: () => void, enabled = true) {
  useEffect(() => {
    if (!enabled) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handler();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handler, enabled]);
}
