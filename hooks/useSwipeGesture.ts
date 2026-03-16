'use client';

import { useRef, useCallback, useState } from 'react';

interface UseSwipeGestureOptions {
  threshold?: number;
  onSwipeDown?: () => void;
  scrollContainerRef?: React.RefObject<HTMLElement | null>;
}

export function useSwipeGesture({ threshold = 120, onSwipeDown, scrollContainerRef }: UseSwipeGestureOptions) {
  const swipeStartY = useRef(0);
  const isSwiping = useRef(false);
  const [swipeOffset, setSwipeOffset] = useState(0);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const scrollTop = scrollContainerRef?.current?.scrollTop ?? 0;
    if (scrollTop > 5) return;
    swipeStartY.current = e.touches[0].clientY;
    isSwiping.current = false;
  }, [scrollContainerRef]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    const scrollTop = scrollContainerRef?.current?.scrollTop ?? 0;
    const diff = e.touches[0].clientY - swipeStartY.current;
    if (diff > 10 && scrollTop <= 0 && !isSwiping.current) {
      isSwiping.current = true;
    }
    if (isSwiping.current) {
      e.preventDefault();
      setSwipeOffset(Math.max(0, diff));
    }
  }, [scrollContainerRef]);

  const handleTouchEnd = useCallback(() => {
    if (isSwiping.current && swipeOffset > threshold) {
      onSwipeDown?.();
    }
    setSwipeOffset(0);
    isSwiping.current = false;
  }, [swipeOffset, threshold, onSwipeDown]);

  return { swipeOffset, handleTouchStart, handleTouchMove, handleTouchEnd };
}
