import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

type ChromeStub = {
  storage: { sync: { get: ReturnType<typeof vi.fn> } };
  runtime: { onMessage: { addListener: () => void } };
};

let stub: ChromeStub;
let resolveModeForSelection: () => Promise<string>;
let DEFAULT_MODE: string;

beforeAll(async () => {
  stub = {
    storage: { sync: { get: vi.fn(async () => ({})) } },
    runtime: { onMessage: { addListener: () => {} } },
  };
  (globalThis as unknown as { chrome: unknown }).chrome = stub;
  const mod = await import('../index');
  resolveModeForSelection = mod.resolveModeForSelection;
  const modes = await import('@promptlens/core');
  DEFAULT_MODE = modes.DEFAULT_MODE;
});

afterEach(() => {
  stub.storage.sync.get.mockReset();
});

describe('resolveModeForSelection (mode propagation)', () => {
  it('returns stored mode when valid', async () => {
    stub.storage.sync.get.mockResolvedValue({ mode: 'product_style' });
    await expect(resolveModeForSelection()).resolves.toBe('product_style');
  });

  it('returns DEFAULT_MODE when stored value is unknown', async () => {
    stub.storage.sync.get.mockResolvedValue({ mode: 'not_a_mode' });
    await expect(resolveModeForSelection()).resolves.toBe(DEFAULT_MODE);
  });

  it('returns DEFAULT_MODE when storage throws', async () => {
    stub.storage.sync.get.mockRejectedValue(new Error('boom'));
    await expect(resolveModeForSelection()).resolves.toBe(DEFAULT_MODE);
  });

  it('returns DEFAULT_MODE when storage returns nothing', async () => {
    stub.storage.sync.get.mockResolvedValue({});
    await expect(resolveModeForSelection()).resolves.toBe(DEFAULT_MODE);
  });
});
