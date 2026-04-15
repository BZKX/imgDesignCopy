import { useEffect, useState } from 'react';
import { MSG, type HistoryEntryDto } from '@promptlens/core';
import { MODE_META, type Mode } from '@promptlens/core';
import type { PromptResult, ProductStyle, WebDesign } from '@promptlens/core';
import { PromptRenderer } from './renderers/prompt';
import { ProductStyleRenderer } from './renderers/product-style';
import { WebDesignRenderer } from './renderers/webpage-style';
import { formatTime, rpc } from './panel-utils';
import { ModeIcon } from './icons';
import { useT } from '@/lib/i18n';

function modeName(mode: Mode, lang: 'zh' | 'en'): string {
  const meta = MODE_META[mode];
  return lang === 'en' ? meta.displayName.en : meta.displayName['zh-CN'];
}

export function HistoryList({ onOpen }: { onOpen: (entry: HistoryEntryDto) => void }) {
  const { t, lang } = useT();
  const [entries, setEntries] = useState<HistoryEntryDto[] | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);

  async function refresh() {
    const res = await rpc<{ ok: boolean; entries?: HistoryEntryDto[] }>({
      type: MSG.RPC_HISTORY_LIST,
    });
    setEntries(res?.entries ?? []);
  }

  useEffect(() => {
    void refresh();
  }, []);

  async function clearAll() {
    await rpc({ type: MSG.RPC_HISTORY_CLEAR });
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
        <div className="empty-title">{t('history.empty.title')}</div>
        <div className="empty-desc">{t('history.empty.desc')}</div>
      </div>
    );
  }
  return (
    <>
      {confirmClear ? (
        <div className="inline-confirm">
          <span>{t('history.confirmClearPrompt')}</span>
          <div className="inline-confirm-actions">
            <button type="button" className="btn btn-danger" onClick={clearAll}>
              {t('history.clear')}
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => setConfirmClear(false)}>
              {t('common.cancel')}
            </button>
          </div>
        </div>
      ) : (
        <div className="history-toolbar">
          <span className="history-count">{entries.length} {t('history.count')}</span>
          <button type="button" className="link-danger" onClick={() => setConfirmClear(true)}>
            {t('history.clear')}
          </button>
        </div>
      )}
      <div className="history-grid">
        {entries.map((e) => (
          <button key={e.id} type="button" className="history-item" onClick={() => onOpen(e)}>
            <div className="history-thumb">
              <LazyThumb id={e.id} />
              <span className="history-mode" title={modeName(e.mode, lang)}>
                <ModeIcon mode={e.mode} />
              </span>
            </div>
            <div className="history-time">{formatTime(e.createdAt, lang)}</div>
          </button>
        ))}
      </div>
    </>
  );
}

export function LazyThumb({ id }: { id: string }) {
  const [src, setSrc] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    rpc<{ ok: boolean; thumbnailB64?: string }>({
      type: MSG.RPC_HISTORY_THUMB,
      id,
    }).then((res) => {
      if (cancelled) return;
      if (res?.ok && res.thumbnailB64) {
        setSrc(`data:image/jpeg;base64,${res.thumbnailB64}`);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [id]);
  if (!src) return <div className="thumb-skeleton" />;
  return <img src={src} alt="" />;
}

export function HistoryDetail({
  entry,
  onDeleted,
}: {
  entry: HistoryEntryDto;
  onDeleted: () => void;
}) {
  const { t, lang } = useT();
  const [confirm, setConfirm] = useState(false);
  const mode: Mode = entry.mode;

  async function del() {
    await rpc({ type: MSG.RPC_HISTORY_DELETE, id: entry.id });
    onDeleted();
  }

  return (
    <>
      <div className="hero">
        <LazyThumb id={entry.id} />
      </div>
      <div className="history-meta">
        <span>
          <span className="history-mode-inline"><ModeIcon mode={mode} /></span>{' '}
          {modeName(mode, lang)} · {formatTime(entry.createdAt, lang)}
        </span>
        {confirm ? (
          <span className="inline-confirm-mini">
            <button type="button" className="btn btn-danger btn-sm" onClick={del}>
              {t('history.confirmClearDetail')}
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setConfirm(false)}
            >
              {t('common.cancel')}
            </button>
          </span>
        ) : (
          <button type="button" className="link-danger" onClick={() => setConfirm(true)}>
            {t('common.delete')}
          </button>
        )}
      </div>
      {mode === 'image_to_prompt' && (
        <PromptRenderer result={entry.insight as PromptResult} />
      )}
      {mode === 'product_style' && (
        <ProductStyleRenderer result={entry.insight as ProductStyle} />
      )}
      {mode === 'webpage_style' && (
        <WebDesignRenderer result={entry.insight as WebDesign} />
      )}
      {entry.pageUrl && (
        <a className="link-source" href={entry.pageUrl} target="_blank" rel="noreferrer">
          {t('history.source')}：{entry.pageUrl}
        </a>
      )}
    </>
  );
}
