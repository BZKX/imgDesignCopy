export function formatTime(ms: number, lang: 'zh' | 'en' = 'zh'): string {
  const locale = lang === 'en' ? 'en-US' : 'zh-CN';
  const d = new Date(ms);
  const now = new Date();
  const sameDay =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();
  if (sameDay) {
    return d.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
  }
  return d.toLocaleDateString(locale, { month: 'short', day: 'numeric' });
}

export function isExtensionAlive(): boolean {
  try {
    return Boolean(chrome?.runtime?.id);
  } catch {
    return false;
  }
}

export async function rpc<T = unknown>(msg: unknown): Promise<T | null> {
  if (!isExtensionAlive()) return null;
  try {
    const res = await chrome.runtime.sendMessage(msg);
    return res as T;
  } catch {
    return null;
  }
}

export function safeSend(msg: unknown): boolean {
  if (!isExtensionAlive()) return false;
  try {
    void chrome.runtime.sendMessage(msg);
    return true;
  } catch {
    return false;
  }
}
