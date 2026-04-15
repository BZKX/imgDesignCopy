import { useEffect, useState } from 'react';
import { MODE_META, type Mode } from '@promptlens/core';
import type { PromptResult, ProductStyle, WebDesign } from '@promptlens/core';
import { PromptRenderer } from '../renderers/prompt';
import { ProductStyleRenderer } from '../renderers/product-style';
import { WebDesignRenderer } from '../renderers/webpage-style';
import { ModeIcon } from '../icons';
import {
  clearHistory,
  deleteHistory,
  listHistory,
  type StoredHistoryEntry,
} from '../platform/history';

function formatTime(ms: number): string {
  const d = new Date(ms);
  const now = new Date();
  const sameDay =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();
  if (sameDay) {
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

export function HistoryList({ onOpen }: { onOpen: (entry: StoredHistoryEntry) => void }) {
  const [entries, setEntries] = useState<StoredHistoryEntry[] | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);

  async function refresh() {
    setEntries(await listHistory());
  }

  useEffect(() => {
    void refresh();
  }, []);

  async function doClear() {
    await clearHistory();
    setConfirmClear(false);
    await refresh();
  }

  if (entries === null) {
    return (
      <div className="loading-state">
        <div className="spinner" />
      </div>
    );
  }
  if (entries.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-title">还没有记录</div>
        <div className="empty-desc">按 ⌘⇧Y 开始第一次识别</div>
      </div>
    );
  }
  return (
    <>
      {confirmClear ? (
        <div className="inline-confirm">
          <span>确定清空全部历史？</span>
          <div className="inline-confirm-actions">
            <button type="button" className="btn btn-danger" onClick={doClear}>
              清空
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setConfirmClear(false)}
            >
              取消
            </button>
          </div>
        </div>
      ) : (
        <div className="history-toolbar">
          <span className="history-count">{entries.length} 条</span>
          <button type="button" className="link-danger" onClick={() => setConfirmClear(true)}>
            清空
          </button>
        </div>
      )}
      <div className="history-grid">
        {entries.map((e) => (
          <button key={e.id} type="button" className="history-item" onClick={() => onOpen(e)}>
            <div className="history-thumb">
              <img src={`data:image/jpeg;base64,${e.thumbnailB64}`} alt="" />
              <span className="history-mode" title={MODE_META[e.mode]?.label ?? e.mode}>
                <ModeIcon mode={e.mode} />
              </span>
            </div>
            <div className="history-time">{formatTime(e.createdAt)}</div>
          </button>
        ))}
      </div>
    </>
  );
}

export function HistoryDetail({
  entry,
  onDeleted,
}: {
  entry: StoredHistoryEntry;
  onDeleted: () => void;
}) {
  const [confirm, setConfirm] = useState(false);
  const mode: Mode = entry.mode;

  async function del() {
    await deleteHistory(entry.id);
    onDeleted();
  }

  return (
    <>
      <div className="hero">
        <img src={`data:image/jpeg;base64,${entry.thumbnailB64}`} alt="" />
      </div>
      <div className="history-meta">
        <span>
          <span className="history-mode-inline">
            <ModeIcon mode={mode} />
          </span>{' '}
          {MODE_META[mode]?.label ?? mode} · {formatTime(entry.createdAt)}
        </span>
        {confirm ? (
          <span className="inline-confirm-mini">
            <button type="button" className="btn btn-danger btn-sm" onClick={del}>
              确认删除
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setConfirm(false)}
            >
              取消
            </button>
          </span>
        ) : (
          <button type="button" className="link-danger" onClick={() => setConfirm(true)}>
            删除
          </button>
        )}
      </div>
      {mode === 'image_to_prompt' && <PromptRenderer result={entry.insight as PromptResult} />}
      {mode === 'product_style' && <ProductStyleRenderer result={entry.insight as ProductStyle} />}
      {mode === 'webpage_style' && <WebDesignRenderer result={entry.insight as WebDesign} />}
    </>
  );
}
