import {
  LATEST_PENDING_KEY,
  MSG,
  type ErrorCode,
  type ErrorMsg,
  type HistoryEntryDto,
  type Img2PromptMessage,
  type LoadingMsg,
  type LoadingStep,
  type ResultMsg,
  type ResultPayload,
  type SelectionCompleteMsg,
} from '@promptlens/core';
import { loadConfig } from '@/lib/config';
import { DEFAULT_MODE, isMode, type Mode } from '@promptlens/core';
import {
  AuthError,
  NetworkError,
  RateLimitError,
  SchemaError,
  generateInsight,
} from '@promptlens/core';
import { getAdapter, isProvider } from '@promptlens/core';
import * as storage from '@/lib/storage';
import { cropToBase64 } from './capture';

chrome.runtime.onInstalled.addListener(() => {
  console.log('[img2prompt] installed');
});

chrome.action.onClicked.addListener(async (tab) => {
  if (!tab?.id || !tab.url) return;
  if (isRestrictedUrl(tab.url)) {
    await pushError(tab.id, 'RESTRICTED_PAGE', '此页面浏览器不允许扩展操作，换一个普通网页即可。');
    return;
  }
  try {
    await chrome.tabs.sendMessage(tab.id, { type: MSG.PANEL_OPEN });
  } catch (err) {
    await pushError(
      tab.id,
      'RESTRICTED_PAGE',
      `Content script 未加载，请刷新页面。${errMsg(err)}`,
    );
  }
});

chrome.commands.onCommand.addListener(async (command) => {
  if (command !== 'start-selection') return;
  try {
    await startSelectionOnActiveTab();
  } catch (err) {
    console.error('[img2prompt] start-selection failed', err);
    await pushError(null, 'UNKNOWN', errMsg(err));
  }
});

chrome.runtime.onMessage.addListener((msg: unknown, sender, sendResponse) => {
  const m = msg as { type?: string };
  if (!m || typeof m !== 'object') return false;

  if (m.type === MSG.SELECTION_COMPLETE) {
    const tabId = sender.tab?.id ?? null;
    handleSelectionComplete(msg as SelectionCompleteMsg, tabId).catch(async (err) => {
      console.error('[img2prompt] selection handler failed', err);
      await pushError(tabId, 'UNKNOWN', errMsg(err));
    });
    sendResponse({ ack: true });
    return false;
  }
  if (m.type === MSG.SELECTION_CANCEL) {
    sendResponse({ ack: true });
    return false;
  }

  if (m.type === MSG.RPC_START_SELECTION) {
    startSelectionOnActiveTab()
      .then(() => sendResponse({ ok: true }))
      .catch((err) => sendResponse({ ok: false, error: errMsg(err) }));
    return true;
  }

  if (m.type === MSG.RPC_HISTORY_LIST) {
    (async () => {
      try {
        const rows = await storage.list(100);
        const entries: HistoryEntryDto[] = rows.map((r) => ({
          id: r.id,
          createdAt: r.createdAt,
          pageUrl: r.pageUrl,
          mode: r.mode,
          insight: r.insight as HistoryEntryDto['insight'],
        }));
        sendResponse({ ok: true, entries });
      } catch (err) {
        sendResponse({ ok: false, error: errMsg(err) });
      }
    })();
    return true;
  }

  if (m.type === MSG.RPC_HISTORY_THUMB) {
    const id = (msg as { id?: string }).id;
    (async () => {
      try {
        if (!id) throw new Error('Missing id');
        const row = await storage.getOne(id);
        if (!row) {
          sendResponse({ ok: false, error: 'not found' });
          return;
        }
        const thumbnailB64 = await blobToB64(row.thumbnailBlob);
        sendResponse({ ok: true, thumbnailB64 });
      } catch (err) {
        sendResponse({ ok: false, error: errMsg(err) });
      }
    })();
    return true;
  }

  if (m.type === MSG.RPC_HISTORY_DELETE) {
    const id = (msg as { id?: string }).id;
    (async () => {
      try {
        if (!id) throw new Error('Missing id');
        await storage.remove(id);
        sendResponse({ ok: true });
      } catch (err) {
        sendResponse({ ok: false, error: errMsg(err) });
      }
    })();
    return true;
  }

  if (m.type === MSG.RPC_HISTORY_CLEAR) {
    (async () => {
      try {
        await storage.clear();
        sendResponse({ ok: true });
      } catch (err) {
        sendResponse({ ok: false, error: errMsg(err) });
      }
    })();
    return true;
  }

  if (m.type === MSG.RPC_TEST_CONNECTION) {
    const cfg = (msg as {
      config?: { provider?: string; baseURL: string; apiKey: string; model: string };
    }).config;
    (async () => {
      try {
        if (!cfg) throw new Error('Missing config');
        const provider = isProvider(cfg.provider) ? cfg.provider : 'openai';
        const adapter = getAdapter(provider);
        // 1x1 transparent PNG
        const pingImage =
          'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNgAAIAAAUAAen63NgAAAAASUVORK5CYII=';
        const { url, init } = adapter.buildRequest({
          baseURL: cfg.baseURL,
          apiKey: cfg.apiKey,
          model: cfg.model,
          systemPrompt: 'ping',
          userText: 'ping',
          imageBase64: pingImage,
          mime: 'image/png',
          temperature: 0,
          maxTokens: 1,
        });
        const res = await fetch(url, init);
        sendResponse({ ok: res.ok, status: res.status });
      } catch (err) {
        sendResponse({ ok: false, error: errMsg(err) });
      }
    })();
    return true;
  }

  return false;
});

async function startSelectionOnActiveTab(): Promise<void> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id || !tab.url) {
    await pushError(null, 'RESTRICTED_PAGE', 'No active tab available.');
    return;
  }
  if (isRestrictedUrl(tab.url)) {
    await pushError(
      tab.id,
      'RESTRICTED_PAGE',
      '此页面浏览器不允许扩展截图，换一个普通网页即可。',
    );
    return;
  }
  try {
    await chrome.tabs.sendMessage(tab.id, { type: MSG.START_SELECTION });
  } catch (err) {
    await pushError(
      tab.id,
      'RESTRICTED_PAGE',
      `Content script 未加载，请刷新页面。${errMsg(err)}`,
    );
  }
}

export async function reportStep(
  tabId: number | null,
  mode: Mode,
  step: LoadingStep,
  t0: number,
  seqRef: { current: number },
  extras?: { failedAt?: LoadingStep; errorCode?: ErrorCode },
): Promise<void> {
  seqRef.current += 1;
  const msg: LoadingMsg = {
    type: MSG.LOADING,
    seq: seqRef.current,
    startedAt: t0,
    step,
    elapsedMs: Date.now() - t0,
    mode,
    ...(extras ?? {}),
  };
  console.log('[progress]', step, `${msg.elapsedMs}ms`, extras ?? '');
  await sendToTab(tabId, msg);
  await setSessionLatest(msg);
}

export async function handleSelectionComplete(
  msg: SelectionCompleteMsg,
  tabId: number | null,
): Promise<void> {
  const t0 = Date.now();
  const seqRef = { current: 0 };
  const requestedMode = (msg as { mode?: unknown }).mode;
  const mode: Mode = isMode(requestedMode)
    ? requestedMode
    : (console.warn('[img2prompt] unknown mode, falling back', requestedMode), DEFAULT_MODE);
  let lastStep: LoadingStep | undefined;

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const targetTabId = tabId ?? tab?.id ?? null;
  console.log('[img2prompt] selection received', { tabId: targetTabId, rect: msg.rect, mode });
  if (!tab?.windowId) {
    await pushError(targetTabId, 'CAPTURE_FAILED', 'No active window to capture.');
    return;
  }

  const captureP = chrome.tabs
    .captureVisibleTab(tab.windowId, { format: 'jpeg', quality: 88 })
    .catch((err) => {
      console.error('[img2prompt] captureVisibleTab FAILED', err);
      throw err;
    });
  const configP = loadConfig();

  let dataUrl: string;
  try {
    dataUrl = await captureP;
  } catch (err) {
    await reportStep(targetTabId, mode, 'failed', t0, seqRef, {
      failedAt: lastStep,
      errorCode: 'CAPTURE_FAILED',
    });
    await pushError(targetTabId, 'CAPTURE_FAILED', `captureVisibleTab failed: ${errMsg(err)}`);
    return;
  }
  await reportStep(targetTabId, mode, 'captured', t0, seqRef);
  lastStep = 'captured';

  let cropped: { base64: string; blob: Blob; mime: string };
  try {
    cropped = await cropToBase64(dataUrl, msg.rect, msg.dpr);
  } catch (err) {
    console.error('[img2prompt] crop FAILED', err);
    await reportStep(targetTabId, mode, 'failed', t0, seqRef, {
      failedAt: lastStep,
      errorCode: 'CAPTURE_FAILED',
    });
    await pushError(targetTabId, 'CAPTURE_FAILED', `Crop failed: ${errMsg(err)}`);
    return;
  }
  await reportStep(targetTabId, mode, 'cropped', t0, seqRef);
  lastStep = 'cropped';

  const config = await configP;
  if (!config.apiKey && config.provider !== 'ollama') {
    console.warn('[img2prompt] no api key configured');
    await reportStep(targetTabId, mode, 'failed', t0, seqRef, {
      failedAt: lastStep,
      errorCode: 'NO_CONFIG',
    });
    await pushError(targetTabId, 'NO_CONFIG', 'API key 尚未配置，请打开设置填写。');
    return;
  }

  await reportStep(targetTabId, mode, 'inferring', t0, seqRef);
  lastStep = 'inferring';

  try {
    const tApi = Date.now();
    const insight = await generateInsight(mode, {
      provider: config.provider,
      baseURL: config.baseURL,
      apiKey: config.apiKey,
      model: config.model,
      language: config.language,
      imageBase64: cropped.base64,
      mime: cropped.mime,
    });
    console.log('[img2prompt] vision ok', `${Date.now() - tApi}ms`);
    await reportStep(targetTabId, mode, 'parsing', t0, seqRef);
    lastStep = 'parsing';

    const payload: ResultPayload = {
      thumbnailB64: cropped.base64,
      mode,
      insight,
      pageUrl: msg.pageUrl,
      createdAt: Date.now(),
    };

    try {
      await storage.addAndPrune(
        {
          id: cryptoId(),
          createdAt: payload.createdAt,
          thumbnailBlob: cropped.blob,
          pageUrl: msg.pageUrl,
          mode,
          insight,
        },
        config.maxHistory,
      );
    } catch (err) {
      console.warn('[img2prompt] history write failed', err);
    }

    const resultMsg: ResultMsg = { type: MSG.RESULT, payload };
    await setSessionLatest(payload);
    await reportStep(targetTabId, mode, 'done', t0, seqRef);
    await sendToTab(targetTabId, resultMsg);
    console.log('[img2prompt] RESULT sent to tab', targetTabId, `total ${Date.now() - t0}ms`);
  } catch (err) {
    const code = classifyApiError(err);
    console.error('[img2prompt] vision FAILED', code, err);
    await reportStep(targetTabId, mode, 'failed', t0, seqRef, {
      failedAt: lastStep,
      errorCode: code,
    });
    await pushError(targetTabId, code, errMsg(err));
  }
}

async function sendToTab(tabId: number | null, msg: Img2PromptMessage): Promise<void> {
  if (tabId == null) {
    console.warn('[img2prompt] sendToTab: no tabId', msg.type);
    return;
  }
  try {
    await chrome.tabs.sendMessage(tabId, msg);
  } catch (err) {
    console.warn('[img2prompt] sendToTab failed', msg.type, tabId, errMsg(err));
  }
}

async function setSessionLatest(payload: unknown): Promise<void> {
  try {
    await chrome.storage.session.set({ [LATEST_PENDING_KEY]: payload });
  } catch {
    /* ignore */
  }
}

function classifyApiError(err: unknown): ErrorCode {
  if (err instanceof AuthError) return 'UNAUTHORIZED';
  if (err instanceof RateLimitError) return 'RATE_LIMITED';
  if (err instanceof SchemaError) return 'INVALID_RESPONSE';
  if (err instanceof NetworkError) return 'NETWORK_ERROR';
  if (err instanceof Error && err.name === 'AbortError') return 'TIMEOUT';
  return 'UNKNOWN';
}

async function pushError(tabId: number | null, code: ErrorCode, message: string): Promise<void> {
  const payload: ErrorMsg = { type: MSG.ERROR, code, message };
  await setSessionLatest(payload);
  await sendToTab(tabId, payload);
}

function isRestrictedUrl(url: string): boolean {
  return (
    url.startsWith('chrome://') ||
    url.startsWith('chrome-extension://') ||
    url.startsWith('edge://') ||
    url.startsWith('about:') ||
    url.startsWith('view-source:') ||
    url.startsWith('https://chrome.google.com/webstore') ||
    url.startsWith('https://chromewebstore.google.com')
  );
}

function errMsg(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

function cryptoId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

async function blobToB64(blob: Blob): Promise<string> {
  const buf = await blob.arrayBuffer();
  let binary = '';
  const bytes = new Uint8Array(buf);
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

export {};
