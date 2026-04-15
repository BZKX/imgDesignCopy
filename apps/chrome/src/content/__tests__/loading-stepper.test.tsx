import { afterEach, describe, expect, it } from 'vitest';
import { createRoot, type Root } from 'react-dom/client';
import { act } from 'react-dom/test-utils';
import { LoadingStepper } from '../loading-stepper';

let container: HTMLDivElement | null = null;
let root: Root | null = null;

function render(el: React.ReactElement): HTMLDivElement {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  act(() => {
    root!.render(el);
  });
  return container;
}

afterEach(() => {
  if (root) {
    act(() => root!.unmount());
    root = null;
  }
  if (container && container.parentNode) container.remove();
  container = null;
});

describe('<LoadingStepper />', () => {
  it('renders all 5 steps', () => {
    const c = render(
      <LoadingStepper currentStep="captured" history={[]} />,
    );
    expect(c.querySelectorAll('.stepper-step')).toHaveLength(5);
  });

  it('applies --current to the in-progress step', () => {
    const c = render(
      <LoadingStepper currentStep="inferring" history={[]} />,
    );
    const current = c.querySelector('.stepper-step--current');
    expect(current).not.toBeNull();
    expect(current!.textContent).toMatch(/正在识别风格/);
  });

  it('marks earlier steps as done based on currentStep order', () => {
    const c = render(
      <LoadingStepper currentStep="inferring" history={[]} />,
    );
    const doneEls = c.querySelectorAll('.stepper-step--done');
    const labels = Array.from(doneEls).map((el) =>
      el.querySelector('.stepper-label')?.textContent?.trim(),
    );
    expect(labels).toEqual(['截图', '压缩上传']);
    expect(c.querySelector('.stepper-elapsed')?.textContent).toBe('loading…');
  });

  it('marks failedAt step with --failed and shows errorCode', () => {
    const c = render(
      <LoadingStepper
        currentStep="failed"
        failedAt="inferring"
        errorCode="NETWORK_ERROR"
        history={[
          { step: 'captured', elapsedMs: 10 },
          { step: 'cropped', elapsedMs: 20 },
        ]}
      />,
    );
    const failed = c.querySelector('.stepper-step--failed');
    expect(failed).not.toBeNull();
    expect(failed!.textContent).toMatch(/NETWORK_ERROR/);
    // no --current while failed
    expect(c.querySelector('.stepper-step--current')).toBeNull();
  });
});
