import { create } from 'zustand';
import type { HistoryEntry } from '@/lib/storage';
import type { PromptResult } from '@promptlens/core';
import type { ErrorCode, ResultPayload } from '@promptlens/core';

export type PopupView = 'main' | 'history';
export type PopupStatus = 'idle' | 'loading' | 'result' | 'error';
export type ResultTab = 'midjourney' | 'stable_diffusion' | 'dalle';

export interface PopupError {
  code: ErrorCode;
  message: string;
}

interface PopupState {
  view: PopupView;
  status: PopupStatus;
  payload: ResultPayload | null;
  error: PopupError | null;
  tab: ResultTab;
  toast: string | null;
  currentResult: PromptResult | null;
  currentEntry: HistoryEntry | null;
  setView: (v: PopupView) => void;
  setStatus: (s: PopupStatus) => void;
  setPayload: (p: ResultPayload | null) => void;
  setError: (e: PopupError | null) => void;
  setTab: (t: ResultTab) => void;
  setToast: (t: string | null) => void;
  setResult: (r: PromptResult | null) => void;
  setCurrentEntry: (e: HistoryEntry | null) => void;
}

export const usePopupStore = create<PopupState>((set) => ({
  view: 'main',
  status: 'idle',
  payload: null,
  error: null,
  tab: 'midjourney',
  toast: null,
  currentResult: null,
  currentEntry: null,
  setView: (view) => set({ view }),
  setStatus: (status) => set({ status }),
  setPayload: (payload) => set({ payload }),
  setError: (error) => set({ error }),
  setTab: (tab) => set({ tab }),
  setToast: (toast) => set({ toast }),
  setResult: (currentResult) => set({ currentResult }),
  setCurrentEntry: (currentEntry) => set({ currentEntry }),
}));
