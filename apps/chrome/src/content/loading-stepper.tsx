import type { ErrorCode, Language, LoadingStep } from '@promptlens/core';
import { t, type I18nKey } from '@/lib/i18n';

const STEPS: { key: LoadingStep; labelKey: I18nKey; activeKey: I18nKey }[] = [
  { key: 'captured', labelKey: 'stepper.label.captured', activeKey: 'stepper.active.captured' },
  { key: 'cropped', labelKey: 'stepper.label.cropped', activeKey: 'stepper.active.cropped' },
  { key: 'inferring', labelKey: 'stepper.label.inferring', activeKey: 'stepper.active.inferring' },
  { key: 'parsing', labelKey: 'stepper.label.parsing', activeKey: 'stepper.active.parsing' },
  { key: 'done', labelKey: 'stepper.label.done', activeKey: 'stepper.active.done' },
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
  lang?: Language;
}

export function LoadingStepper({
  currentStep,
  failedAt,
  errorCode,
  lang = 'zh',
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
                {isCurrent ? t(s.activeKey, lang) : t(s.labelKey, lang)}
                {isFailed && errorCode && (
                  <span className="stepper-error"> · {errorCode}</span>
                )}
              </div>
              {isCurrent && currentStep !== 'done' && (
                <div className="stepper-elapsed">{t('stepper.loading', lang)}</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
