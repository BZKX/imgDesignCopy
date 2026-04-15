import type { ErrorCode, LoadingStep } from '@promptlens/core';

const STEPS: { key: LoadingStep; label: string; active: string }[] = [
  { key: 'captured', label: '截图', active: '正在截图…' },
  { key: 'cropped', label: '压缩上传', active: '正在压缩上传…' },
  { key: 'inferring', label: '风格识别', active: '正在识别风格…' },
  { key: 'parsing', label: '结构解析', active: '正在解析结构…' },
  { key: 'done', label: '完成', active: '完成' },
];

const ORDER: Record<LoadingStep, number> = {
  captured: 0,
  cropped: 1,
  inferring: 2,
  parsing: 3,
  done: 4,
  failed: -1,
};

export interface StepHistoryEntry {
  step: LoadingStep;
  elapsedMs: number;
}

export interface LoadingStepperProps {
  currentStep: LoadingStep;
  history: StepHistoryEntry[];
  failedAt?: LoadingStep;
  errorCode?: ErrorCode;
}

export function LoadingStepper({
  currentStep,
  failedAt,
  errorCode,
}: LoadingStepperProps) {
  const currentIdx = ORDER[currentStep];
  const failedIdx = failedAt ? ORDER[failedAt] : -1;

  return (
    <div className="stepper" role="status" aria-live="polite">
      {STEPS.map((s, i) => {
        const idx = ORDER[s.key];
        const isFailed = currentStep === 'failed' && failedIdx === idx;
        const isCurrent =
          !isFailed && currentStep !== 'failed' && idx === currentIdx;
        const isDone =
          !isCurrent &&
          !isFailed &&
          (currentStep === 'failed'
            ? idx < failedIdx
            : idx < currentIdx);

        let cls = 'stepper-step';
        if (isCurrent) cls += ' stepper-step--current';
        else if (isDone) cls += ' stepper-step--done';
        else if (isFailed) cls += ' stepper-step--failed';
        else cls += ' stepper-step--pending';

        return (
          <div key={s.key} className={cls}>
            <div className="stepper-rail">
              <span className="stepper-dot" aria-hidden />
              {i < STEPS.length - 1 && <span className="stepper-line" aria-hidden />}
            </div>
            <div className="stepper-body">
              <div className="stepper-label">
                {isCurrent ? s.active : s.label}
                {isFailed && errorCode && (
                  <span className="stepper-error"> · {errorCode}</span>
                )}
              </div>
              {isCurrent && currentStep !== 'done' && (
                <div className="stepper-elapsed">loading…</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
