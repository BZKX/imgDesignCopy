import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import type { LoadingMsg, LoadingStep } from '@promptlens/core';

type Sent = { tabId: number; msg: LoadingMsg };
const sent: Sent[] = [];

let reportStep: typeof import('../index').reportStep;

beforeAll(async () => {
  (globalThis as unknown as { chrome: unknown }).chrome = {
    runtime: {
      onInstalled: { addListener: () => {} },
      onMessage: { addListener: () => {} },
    },
    action: { onClicked: { addListener: () => {} } },
    commands: { onCommand: { addListener: () => {} } },
    tabs: {
      sendMessage: vi.fn(async (tabId: number, msg: unknown) => {
        if ((msg as { type?: string }).type === 'IMG2PROMPT_LOADING') {
          sent.push({ tabId, msg: msg as LoadingMsg });
        }
      }),
      query: vi.fn(async () => []),
      captureVisibleTab: vi.fn(async () => ''),
    },
    storage: {
      session: { set: vi.fn(async () => {}) },
      sync: { get: vi.fn(async () => ({})) },
    },
  };
  const mod = await import('../index');
  reportStep = mod.reportStep;
});

beforeEach(() => {
  sent.length = 0;
});

describe('reportStep — PROGRESS event contract', () => {
  it('emits 5 LoadingMsg with monotonic seq and ordered steps', async () => {
    const seqRef = { current: 0 };
    const t0 = Date.now();
    const steps: LoadingStep[] = ['captured', 'cropped', 'inferring', 'parsing', 'done'];
    for (const step of steps) {
      await reportStep(42, 'image_to_prompt', step, t0, seqRef);
    }
    expect(sent).toHaveLength(5);
    expect(sent.map((s) => s.msg.seq)).toEqual([1, 2, 3, 4, 5]);
    expect(sent.map((s) => s.msg.step)).toEqual(steps);
    for (const s of sent) {
      expect(s.tabId).toBe(42);
      expect(s.msg.mode).toBe('image_to_prompt');
      expect(s.msg.startedAt).toBe(t0);
      expect(s.msg.elapsedMs).toBeGreaterThanOrEqual(0);
    }
  });

  it('carries failedAt + errorCode on failed step and preserves monotonic seq', async () => {
    const seqRef = { current: 0 };
    const t0 = Date.now();
    await reportStep(7, 'product_style', 'captured', t0, seqRef);
    await reportStep(7, 'product_style', 'cropped', t0, seqRef);
    await reportStep(7, 'product_style', 'failed', t0, seqRef, {
      failedAt: 'inferring',
      errorCode: 'NETWORK_ERROR',
    });
    expect(sent.map((s) => s.msg.seq)).toEqual([1, 2, 3]);
    const last = sent[2].msg;
    expect(last.step).toBe('failed');
    expect(last.failedAt).toBe('inferring');
    expect(last.errorCode).toBe('NETWORK_ERROR');
    expect(last.mode).toBe('product_style');
  });

  it('silently skips send when tabId is null', async () => {
    const seqRef = { current: 0 };
    await reportStep(null, 'webpage_style', 'captured', Date.now(), seqRef);
    expect(sent).toHaveLength(0);
    // seq still incremented
    expect(seqRef.current).toBe(1);
  });
});
