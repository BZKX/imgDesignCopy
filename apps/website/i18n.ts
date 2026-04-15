import { getRequestConfig } from 'next-intl/server';
import type { AbstractIntlMessages } from 'next-intl';
import { cookies } from 'next/headers';

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const cookieVal = cookieStore.get('NEXT_LOCALE')?.value;
  const locale = cookieVal === 'en' ? 'en' : 'zh-CN';

  const messages = (await import(`./messages/${locale}.json`)).default as AbstractIntlMessages;

  return { locale, messages };
});
