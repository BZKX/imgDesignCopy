import { describe, expect, it } from 'vitest';
import en from '../messages/en.json';
import zhCN from '../messages/zh-CN.json';

function collectKeyPaths(obj: unknown, prefix = ''): string[] {
  if (typeof obj !== 'object' || obj === null) return [prefix];
  return Object.entries(obj as Record<string, unknown>).flatMap(([key, val]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    return collectKeyPaths(val, path);
  });
}

describe('i18n parity', () => {
  it('zh-CN and en have identical key sets (recursive deep equality)', () => {
    const zhKeys = collectKeyPaths(zhCN).sort();
    const enKeys = collectKeyPaths(en).sort();
    expect(zhKeys).toEqual(enKeys);
  });
});
