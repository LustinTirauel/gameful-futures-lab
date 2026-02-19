import { useCallback, useRef } from 'react';

type UsePeopleScrollControlsParams = {
  enabled: boolean;
  onProgressDelta: (delta: number) => void;
};

const lineHeightPx = 16;
const pageHeightPx = 120;

function normalizeWheelDelta(event: React.WheelEvent<HTMLDivElement>): number {
  if (event.deltaMode === 1) return event.deltaY * lineHeightPx;
  if (event.deltaMode === 2) return event.deltaY * pageHeightPx;
  return event.deltaY;
}

export function usePeopleScrollControls({ enabled, onProgressDelta }: UsePeopleScrollControlsParams) {
  const touchStartYRef = useRef(0);

  const onWheel = useCallback(
    (event: React.WheelEvent<HTMLDivElement>) => {
      if (!enabled) return;
      event.preventDefault();
      onProgressDelta(normalizeWheelDelta(event) * 0.0008);
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
      onProgressDelta(deltaY * 0.0025);
    },
    [enabled, onProgressDelta],
  );

  return {
    onWheel,
    onTouchStart,
    onTouchMove,
  };
}
