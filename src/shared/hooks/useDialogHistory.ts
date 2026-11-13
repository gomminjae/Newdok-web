'use client';

import { useEffect, useRef } from 'react';
import { registerDialogHistory } from '@/shared/lib/dialog-history';

export function useDialogHistory(onClose: () => void, busy = false) {
  const current = useRef({ onClose, busy });
  useEffect(() => { current.current = { onClose, busy }; }, [onClose, busy]);
  useEffect(() => registerDialogHistory(() => current.current.onClose(), () => current.current.busy), []);
}
