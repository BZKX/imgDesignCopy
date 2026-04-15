import { useEffect, useState } from 'react';
import { loadConfig } from '@/lib/config';
import { History } from './History';
import { usePopupStore } from './store';

export function Popup() {
  const view = usePopupStore((s) => s.view);
  const setView = usePopupStore((s) => s.setView);
  const [hasKey, setHasKey] = useState<boolean | null>(null);

  useEffect(() => {
    loadConfig()
      .then((c) => setHasKey(Boolean(c.apiKey)))
      .catch(() => setHasKey(false));
  }, []);

  if (view === 'history') {
    return <History />;
  }

  return (
    <main className="flex w-[340px] flex-col gap-5 bg-white p-6 text-[#1d1d1f]">
      <header className="flex items-center gap-2">
        <img
          src={chrome.runtime.getURL('icons/icon-48.png')}
          alt=""
          aria-hidden="true"
          className="h-6 w-6 rounded-md object-contain"
        />
        <h1 className="text-[15px] font-semibold tracking-tight">PromptLens</h1>
      </header>

      <section className="rounded-2xl bg-[#f5f5f7] p-5">
        <p className="mb-3 text-[13px] font-medium text-[#1d1d1f]">
          按快捷键，框选页面上任意区域
        </p>
        <div className="flex items-center gap-1.5">
          <Kbd>⌘</Kbd>
          <Kbd>⇧</Kbd>
          <Kbd>Y</Kbd>
          <span className="ml-1.5 text-[11.5px] text-[#86868b]">macOS</span>
          <span className="ml-3 flex items-center gap-1.5">
            <Kbd>Ctrl</Kbd>
            <Kbd>⇧</Kbd>
            <Kbd>Y</Kbd>
            <span className="ml-1.5 text-[11.5px] text-[#86868b]">Win / Linux</span>
          </span>
        </div>
        <p className="mt-3 text-[11.5px] leading-relaxed text-[#86868b]">
          结果会从页面右侧滑出，不会因点击其它位置消失。
        </p>
      </section>

      {hasKey === false && (
        <div className="flex items-start gap-3 rounded-xl bg-[#fff5f0] p-3 text-[12px] text-[#a1501a]">
          <span className="mt-0.5 font-semibold">!</span>
          <span>尚未配置 API，点击下方「设置」填写后即可使用。</span>
        </div>
      )}

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => chrome.runtime?.openOptionsPage?.()}
          className="flex-1 rounded-full bg-[#0071e3] py-2 text-[13px] font-medium text-white transition-colors duration-150 hover:bg-[#0077ed] active:bg-[#006edb]"
        >
          {hasKey ? '设置' : '配置 API'}
        </button>
        <button
          type="button"
          onClick={() => setView('history')}
          className="flex-1 rounded-full bg-[#f5f5f7] py-2 text-[13px] font-medium text-[#1d1d1f] transition-colors duration-150 hover:bg-[#ebebed]"
        >
          历史记录
        </button>
      </div>

      <footer className="border-t border-[rgba(0,0,0,0.06)] pt-3 text-center text-[11px] text-[#86868b]">
        v0.1.0 · 本地存储，零服务器
      </footer>
    </main>
  );
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex min-w-[24px] items-center justify-center rounded-md border border-[rgba(0,0,0,0.08)] bg-white px-1.5 py-0.5 text-[11.5px] font-semibold tracking-tight text-[#1d1d1f] shadow-[0_1px_0_rgba(0,0,0,0.04)]">
      {children}
    </kbd>
  );
}

export default Popup;
