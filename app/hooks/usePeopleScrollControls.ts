import { useCallback, useRef } from 'react';

type UsePeopleScrollControlsParams = {
  enabled: boolean;
  onProgressDelta: (delta: number) => void;
};

const lineHeightPx = 16;
const pageHeightPx = 120;
const wheelProgressPerViewport = 0.4;
const touchProgressPerViewport = 0.9;
const minPixelDelta = 0.5;

function normalizeWheelDelta(event: React.WheelEvent<HTMLDivElement>): number {
  if (event.deltaMode === 1) return event.deltaY * lineHeightPx;
  if (event.deltaMode === 2) return event.deltaY * pageHeightPx;
  return event.deltaY;
}

function getViewportHeightPx(): number {
  if (typeof window === 'undefined') return 900;
  return Math.max(1, window.innerHeight);
}

export function usePeopleScrollControls({ enabled, onProgressDelta }: UsePeopleScrollControlsParams) {
  const touchStartYRef = useRef(0);

  const onWheel = useCallback(
    (event: React.WheelEvent<HTMLDivElement>) => {
      if (!enabled) return;
      event.preventDefault();

      const pixelDelta = normalizeWheelDelta(event);
      if (Math.abs(pixelDelta) < minPixelDelta) return;

      const viewportHeightPx = getViewportHeightPx();
      onProgressDelta((pixelDelta / viewportHeightPx) * wheelProgressPerViewport);
    },
    [enabled, onProgressDelta],
  );

  const onTouchStart = useCallback(
    (event: React.TouchEvent<HTMLDivElement>) => {
      if (!enabled) return;
      touchStartYRef.current = event.touches[0]?.clientY ?? 0;
    },
    [enabled],
  );

  const onTouchMove = useCallback(
    (event: React.TouchEvent<HTMLDivElement>) => {
      if (!enabled) return;
      const currentY = event.touches[0]?.clientY ?? touchStartYRef.current;
      const deltaY = touchStartYRef.current - currentY;
      touchStartYRef.current = currentY;

      if (Math.abs(deltaY) < minPixelDelta) return;

      const viewportHeightPx = getViewportHeightPx();
      onProgressDelta((deltaY / viewportHeightPx) * touchProgressPerViewport);
    },
    [enabled, onProgressDelta],
  );

  return {
    onWheel,
    onTouchStart,
    onTouchMove,
  };
}
