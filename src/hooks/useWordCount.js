// hooks/useWordCount.js
'use client';

import { useMemo } from 'react';

export const useWordCount = (text) => {
  return useMemo(() => {
    if (!text || typeof text !== 'string') return 0;
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  }, [text]);
};