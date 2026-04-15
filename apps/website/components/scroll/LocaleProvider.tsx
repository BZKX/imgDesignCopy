'use client';

import { createContext, useCallback, useContext, useState } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import zhCN from '@/messages/zh-CN.json';
import en from '@/messages/en.json';

const MESSAGES = { 'zh-CN': zhCN, en } as const;
type Locale = keyof typeof MESSAGES;

function readLocaleCookie(): Locale {
  if (typeof document === 'undefined') return 'zh-CN';
  const match = document.cookie.match(/(?:^|;\s*)NEXT_LOCALE=([^;]+)/);
  const val = match?.[1];
  return val === 'en' ? 'en' : 'zh-CN';
}

interface LocaleContextValue {
  locale: Locale;
  toggleLocale: () => void;
}

const LocaleContext = createContext<LocaleContextValue>({
  locale: 'zh-CN',
  toggleLocale: () => undefined,
});

export function useLocaleContext(): LocaleContextValue {
  return useContext(LocaleContext);
}

export default function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<Locale>(readLocaleCookie);

  const toggleLocale = useCallback(() => {
    setLocale((prev) => {
      const next: Locale = prev === 'zh-CN' ? 'en' : 'zh-CN';
      document.cookie = `NEXT_LOCALE=${next}; path=/; max-age=31536000`;
      return next;
    });
  }, []);

  return (
    <LocaleContext.Provider value={{ locale, toggleLocale }}>
      <NextIntlClientProvider locale={locale} messages={MESSAGES[locale]}>
        {children}
      </NextIntlClientProvider>
    </LocaleContext.Provider>
  );
}
