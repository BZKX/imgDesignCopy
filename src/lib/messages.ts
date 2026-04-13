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

export interface HistoryEntryDto {
  id: string;
  createdAt: number;
  pageUrl: string;
  thumbnailB64?: string;
  prompts: {
    midjourney: string;
    stable_diffusion: {
      positive: string;
      negative: string;
      weights_explained: string;
    };
    dalle: string;
  };
}

export interface LoadingMsg {
  type: typeof MSG.LOADING;
  startedAt: number;
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
  prompts: PromptBundle;
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
