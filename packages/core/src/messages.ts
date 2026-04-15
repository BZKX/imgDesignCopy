import type { Mode } from './modes';
import type { InsightByMode } from './schemas';

export type { InsightByMode };

export const MSG = {
  START_SELECTION: 'IMG2PROMPT_START_SELECTION',
  SELECTION_COMPLETE: 'IMG2PROMPT_SELECTION_COMPLETE',
  SELECTION_CANCEL: 'IMG2PROMPT_SELECTION_CANCEL',
  LOADING: 'IMG2PROMPT_LOADING',
  RESULT: 'IMG2PROMPT_RESULT',
  ERROR: 'IMG2PROMPT_ERROR',
  PANEL_OPEN: 'IMG2PROMPT_PANEL_OPEN',
  RPC_HISTORY_LIST: 'IMG2PROMPT_RPC_HISTORY_LIST',
  RPC_HISTORY_THUMB: 'IMG2PROMPT_RPC_HISTORY_THUMB',
  RPC_HISTORY_DELETE: 'IMG2PROMPT_RPC_HISTORY_DELETE',
  RPC_HISTORY_CLEAR: 'IMG2PROMPT_RPC_HISTORY_CLEAR',
  RPC_TEST_CONNECTION: 'IMG2PROMPT_RPC_TEST_CONNECTION',
  RPC_START_SELECTION: 'IMG2PROMPT_RPC_START_SELECTION',
} as const;

export type InsightShapeHint = InsightByMode[Mode];

export type LoadingStep = 'captured' | 'cropped' | 'inferring' | 'parsing' | 'done' | 'failed';

export interface HistoryEntryDto {
  id: string;
  createdAt: number;
  pageUrl: string;
  mode: Mode;
  insight: InsightShapeHint;
  thumbnailB64?: string;
}

export interface LoadingMsg {
  type: typeof MSG.LOADING;
  seq: number;
  startedAt: number;
  step: LoadingStep;
  elapsedMs: number;
  failedAt?: LoadingStep;
  errorCode?: ErrorCode;
  mode: Mode;
}

export interface SelectionRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface StartSelectionMsg {
  type: typeof MSG.START_SELECTION;
}

export interface SelectionCompleteMsg {
  type: typeof MSG.SELECTION_COMPLETE;
  rect: SelectionRect;
  dpr: number;
  pageUrl: string;
  mode: Mode;
}

export interface SelectionCancelMsg {
  type: typeof MSG.SELECTION_CANCEL;
}

export interface PromptBundle {
  midjourney: string;
  stable_diffusion: {
    positive: string;
    negative: string;
    weights_explained: string;
  };
  dalle: string;
}

export interface ResultPayload {
  thumbnailB64: string;
  mode: Mode;
  insight: InsightShapeHint;
  /** @deprecated v1.0 legacy shape; remove once all consumers read `insight` */
  prompts?: PromptBundle;
  pageUrl: string;
  createdAt: number;
}

export interface ResultMsg {
  type: typeof MSG.RESULT;
  payload: ResultPayload;
}

export type ErrorCode =
  | 'NO_CONFIG'
  | 'CAPTURE_FAILED'
  | 'RESTRICTED_PAGE'
  | 'NETWORK_ERROR'
  | 'UNAUTHORIZED'
  | 'RATE_LIMITED'
  | 'TIMEOUT'
  | 'INVALID_RESPONSE'
  | 'UNKNOWN';

export interface ErrorMsg {
  type: typeof MSG.ERROR;
  code: ErrorCode;
  message: string;
}

export type Img2PromptMessage =
  | StartSelectionMsg
  | SelectionCompleteMsg
  | SelectionCancelMsg
  | LoadingMsg
  | ResultMsg
  | ErrorMsg;

export const LATEST_PENDING_KEY = 'latestPending';

// NOTE for workers #3/#4: after this task, expect TS errors in:
//  - src/background/index.ts (SelectionCompleteMsg.mode, LoadingMsg new fields, ResultPayload.insight)
//  - src/content/side-panel.tsx (ResultPayload.prompts now optional; HistoryEntryDto.prompts removed)
//  - src/content/overlay.tsx (SelectionCompleteMsg.mode required)
//  - src/lib/vision-client.ts / storage.ts (HistoryEntryDto shape)
// These are resolved by tasks #3 and #4 per plan §8a.
