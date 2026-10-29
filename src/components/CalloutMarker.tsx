// CalloutMarker.tsx — Pin marker for Callouts mode
import React from 'react';
import { useTour } from '../sim/tourContext';

interface CalloutMarkerProps {
  num?: number;
  number?: number;
  label: string;
  targetId?: string;
  targetSelector?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  placement?: 'top' | 'bottom' | 'left' | 'right';
  style?: React.CSSProperties;
}

export function CalloutMarker({
  num,
  number,
  label,
  targetId,
  targetSelector,
  position = 'right',
  placement,
  style,
}: CalloutMarkerProps) {
  const { calloutsActive, triggerHighlight } = useTour();

  if (!calloutsActive) return null;

  const markerNum = num ?? number ?? 1;
  const effectivePosition = placement || position;
  const effectiveTargetId = targetId || (targetSelector ? targetSelector.replace(/^#/, '') : undefined);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (effectiveTargetId) {
      triggerHighlight(effectiveTargetId);
      const el = document.getElementById(effectiveTargetId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  };

  const isLeft = position === 'left';
  const isTop = position === 'top';
  const isBottom = position === 'bottom';

  return (
    <div
      onClick={handleClick}
      title={`Callout ${markerNum}: ${label}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        cursor: 'pointer',
        userSelect: 'none',
        zIndex: 40,
        verticalAlign: 'middle',
        ...style,
      }}
    >
      {/* Number Badge */}
      <div
        style={{
          width: 20,
          height: 20,
          borderRadius: '50%',
          background: 'var(--col-info)',
          color: '#F4F1EA',
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          boxShadow: '0 1px 3px rgba(29,31,30,0.2)',
        }}
      >
        {markerNum}
      </div>

      {/* Thin leader line */}
      <div
        style={{
          width: 8,
          height: 1,
          background: 'var(--col-info)',
          flexShrink: 0,
        }}
      />

      {/* Label beside marker */}
      <span
        style={{
          fontSize: 11,
          fontFamily: 'var(--font-ui)',
          color: 'var(--ink)',
          background: 'var(--tint-info)',
          border: '1px solid var(--hairline)',
          borderRadius: 3,
          padding: '1px 6px',
          whiteSpace: 'nowrap',
          lineHeight: 1.4,
        }}
      >
        {label}
      </span>
    </div>
  );
}
