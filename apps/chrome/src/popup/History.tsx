import { useEffect, useMemo, useState } from 'react';
import * as storage from '@/lib/storage';
import type { HistoryEntry } from '@/lib/storage';
import type { PromptResult } from '@promptlens/core';
import { usePopupStore } from './store';

type Format = 'midjourney' | 'stable_diffusion' | 'dalle';

const TABS: { key: Format; label: string }[] = [
  { key: 'midjourney', label: 'Midjourney' },
  { key: 'stable_diffusion', label: 'SD / Flux' },
  { key: 'dalle', label: 'DALL·E' },
];

function formatTime(ms: number): string {
  return new Date(ms).toLocaleString();
}

function promptToText(entry: HistoryEntry, fmt: Format): string {
  const p = entry.insight as PromptResult;
  if (fmt === 'midjourney') return p.midjourney;
  if (fmt === 'dalle') return p.dalle;
  const sd = p.stable_diffusion;
  return `Positive: ${sd.positive}\nNegative: ${sd.negative}${
    sd.weights_explained ? `\nWeights: ${sd.weights_explained}` : ''
  }`.trim();
}

function Thumbnail({ blob, onClick, time }: { blob: Blob; onClick: () => void; time: number }) {
  const url = useMemo(() => URL.createObjectURL(blob), [blob]);
  useEffect(() => () => URL.revokeObjectURL(url), [url]);
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex flex-col gap-1 overflow-hidden text-left"
    >
      <div className="overflow-hidden rounded-xl bg-[#f5f5f7] shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all duration-200 group-hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
        <img
          src={url}
          alt=""
          className="h-24 w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />
      </div>
      <span className="truncate text-[10.5px] text-[#86868b]">{formatTime(time)}</span>
    </button>
  );
}

export function History() {
  const setView = usePopupStore((s) => s.setView);
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [selected, setSelected] = useState<HistoryEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirmingClear, setConfirmingClear] = useState(false);

  async function refresh() {
    setLoading(true);
    try {
      const rows = await storage.list(50);
      setEntries(rows);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  async function handleDelete(id: string) {
    await storage.remove(id);
    if (selected?.id === id) setSelected(null);
    await refresh();
  }

  async function handleClearAll() {
    await storage.clear();
    setSelected(null);
    setConfirmingClear(false);
    await refresh();
  }

  if (selected) {
    return <HistoryDetail entry={selected} onBack={() => setSelected(null)} onDelete={handleDelete} />;
  }

  return (
    <main className="flex w-[340px] flex-col bg-white text-[#1d1d1f]">
      <header className="flex items-center justify-between border-b border-[rgba(0,0,0,0.06)] px-5 py-4">
        <button
          type="button"
          onClick={() => setView('main')}
          className="flex items-center gap-1 text-[13px] font-medium text-[#0071e3] hover:opacity-70"
        >
          <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-3 w-3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M7.5 2L3.5 6l4 4" />
          </svg>
          返回
        </button>
        <h1 className="text-[14px] font-semibold tracking-tight">历史记录</h1>
        <div className="w-10 text-right">
          {entries.length > 0 && !confirmingClear && (
            <button
              type="button"
              onClick={() => setConfirmingClear(true)}
              className="text-[12px] font-medium text-[#ff3b30] hover:opacity-70"
            >
              清空
            </button>
          )}
        </div>
      </header>

      {confirmingClear && (
        <div className="flex items-center justify-between gap-2 border-b border-[rgba(0,0,0,0.06)] bg-[#fff5f0] px-5 py-3">
          <span className="text-[12px] text-[#a1501a]">确定清空全部历史？</span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleClearAll}
              className="rounded-full bg-[#ff3b30] px-3 py-1 text-[11.5px] font-medium text-white hover:opacity-90"
            >
              清空
            </button>
            <button
              type="button"
              onClick={() => setConfirmingClear(false)}
              className="rounded-full bg-[#f5f5f7] px-3 py-1 text-[11.5px] font-medium text-[#1d1d1f] hover:bg-[#ebebed]"
            >
              取消
            </button>
          </div>
        </div>
      )}

      <div className="p-5">
        {loading ? (
          <p className="text-center text-[12px] text-[#86868b]">Loading…</p>
        ) : entries.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-[13px] font-medium text-[#1d1d1f]">还没有记录</p>
            <p className="mt-1 text-[11.5px] text-[#86868b]">
              按 ⌘⇧Y 开始第一次截图
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {entries.map((e) => (
              <Thumbnail
                key={e.id}
                blob={e.thumbnailBlob}
                time={e.createdAt}
                onClick={() => setSelected(e)}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function HistoryDetail({
  entry,
  onBack,
  onDelete,
}: {
  entry: HistoryEntry;
  onBack: () => void;
  onDelete: (id: string) => void | Promise<void>;
}) {
  const [tab, setTab] = useState<Format>('midjourney');
  const [copied, setCopied] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const url = useMemo(() => URL.createObjectURL(entry.thumbnailBlob), [entry.thumbnailBlob]);
  useEffect(() => () => URL.revokeObjectURL(url), [url]);

  async function copy() {
    await navigator.clipboard.writeText(promptToText(entry, tab));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <main className="flex w-[340px] flex-col bg-white text-[#1d1d1f]">
      <header className="flex items-center justify-between border-b border-[rgba(0,0,0,0.06)] px-5 py-4">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1 text-[13px] font-medium text-[#0071e3] hover:opacity-70"
        >
          <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-3 w-3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M7.5 2L3.5 6l4 4" />
          </svg>
          返回
        </button>
        <span className="text-[11px] text-[#86868b]">{formatTime(entry.createdAt)}</span>
        <div className="w-10 text-right">
          {!confirmingDelete && (
            <button
              type="button"
              onClick={() => setConfirmingDelete(true)}
              className="text-[12px] font-medium text-[#ff3b30] hover:opacity-70"
            >
              删除
            </button>
          )}
        </div>
      </header>

      {confirmingDelete && (
        <div className="flex items-center justify-between gap-2 border-b border-[rgba(0,0,0,0.06)] bg-[#fff5f0] px-5 py-3">
          <span className="text-[12px] text-[#a1501a]">确定删除这条？</span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onDelete(entry.id)}
              className="rounded-full bg-[#ff3b30] px-3 py-1 text-[11.5px] font-medium text-white hover:opacity-90"
            >
              删除
            </button>
            <button
              type="button"
              onClick={() => setConfirmingDelete(false)}
              className="rounded-full bg-[#f5f5f7] px-3 py-1 text-[11.5px] font-medium text-[#1d1d1f] hover:bg-[#ebebed]"
            >
              取消
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-4 p-5">
        <div className="overflow-hidden rounded-xl bg-[#f5f5f7] p-3">
          <img src={url} alt="" className="mx-auto max-h-36 rounded-lg object-contain" />
        </div>

        <div className="flex gap-0.5 rounded-xl bg-[#f5f5f7] p-1">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`flex-1 rounded-lg px-2 py-1.5 text-[11.5px] font-medium transition-all ${
                tab === t.key
                  ? 'bg-white text-[#1d1d1f] shadow-[0_1px_2px_rgba(0,0,0,0.06)]'
                  : 'text-[#515154] hover:text-[#1d1d1f]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <pre className="max-h-48 overflow-auto whitespace-pre-wrap break-words rounded-xl border border-[rgba(0,0,0,0.06)] bg-white p-3 text-[12px] leading-relaxed text-[#1d1d1f]">
          {promptToText(entry, tab)}
        </pre>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={copy}
            className="rounded-full bg-[#0071e3] px-5 py-1.5 text-[12.5px] font-medium text-white transition-colors hover:bg-[#0077ed] active:bg-[#006edb]"
          >
            复制
          </button>
          {copied && <span className="text-[12px] font-medium text-[#34c759]">已复制</span>}
          {entry.pageUrl && (
            <a
              href={entry.pageUrl}
              target="_blank"
              rel="noreferrer"
              className="ml-auto max-w-[160px] truncate text-[11px] text-[#86868b] hover:text-[#0071e3]"
              title={entry.pageUrl}
            >
              来源
            </a>
          )}
        </div>
      </div>
    </main>
  );
}

export default History;
