'use client';

import { useEffect, useRef } from 'react';

/**
 * 오버레이가 열릴 때 history.pushState를 추가하고,
 * 브라우저 뒤로가기(popstate) 시 onClose를 호출한다.
 */
export function useBackButton(isOpen: boolean, onClose: () => void) {
  const isOpenRef = useRef(isOpen);
  const pushedRef = useRef(false);

  useEffect(() => {
    isOpenRef.current = isOpen;
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && !pushedRef.current) {
      history.pushState({ overlay: true }, '');
      pushedRef.current = true;
    }

    if (!isOpen && pushedRef.current) {
      pushedRef.current = false;
    }
  }, [isOpen]);

  useEffect(() => {
    const handlePopState = () => {
      if (isOpenRef.current) {
        pushedRef.current = false;
        onClose();
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [onClose]);
}
