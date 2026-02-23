'use client';

import { useEffect } from 'react';
import { useThemeStore, initTheme } from '../../lib/themeStore';

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useThemeStore((s) => s.theme);

  useEffect(() => {
    initTheme();
  }, []);

  return (
    <div className={`app-${theme}`}>
      {children}
    </div>
  );
}
