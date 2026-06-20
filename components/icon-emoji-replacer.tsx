'use client';

import { useEffect } from 'react';
import { iconEmojiMap } from '@/lib/icon-emoji-map';

export function IconEmojiReplacer() {
  useEffect(() => {
    // Replace all .mat span text content with emoji
    const iconSpans = document.querySelectorAll('span.mat');
    
    iconSpans.forEach((span) => {
      const iconName = span.textContent?.trim();
      if (iconName && iconEmojiMap[iconName as keyof typeof iconEmojiMap]) {
        span.textContent = iconEmojiMap[iconName as keyof typeof iconEmojiMap];
      }
    });
  }, []);

  return null;
}
