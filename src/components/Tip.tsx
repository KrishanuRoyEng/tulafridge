// Tip.tsx — Reusable, accessible, auto-flipping tooltip
import React, { useState, useRef, useEffect, useCallback, useId } from 'react';
import './Tip.css';

interface TipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
  style?: React.CSSProperties;
}

export function Tip({
  content,
  children,
  position = 'top',
  className = '',
  style,
}: TipProps) {
  const [visible, setVisible] = useState(false);
  const [actualPos, setActualPos] = useState(position);
  const timerRef = useRef<number | null>(null);
  const bubbleRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const tooltipId = useId();

  const showTip = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      setVisible(true);
    }, 250);
  }, []);

  const hideTip = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setVisible(false);
  }, []);

  const toggleTap = useCallback((e: React.MouseEvent) => {
    // If touched, toggle
    if (window.matchMedia('(pointer: coarse)').matches) {
      e.stopPropagation();
      setVisible(v => !v);
    }
  }, []);

  // Keyboard Escape listener
  useEffect(() => {
    if (!visible) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') hideTip();
    };
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        hideTip();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('click', handleClickOutside);
    };
  }, [visible, hideTip]);

  // Viewport auto-flip
  useEffect(() => {
    if (visible && bubbleRef.current && wrapperRef.current) {
      const rect = bubbleRef.current.getBoundingClientRect();
      let nextPos = position;

      if (position === 'top' && rect.top < 8) nextPos = 'bottom';
      else if (position === 'bottom' && rect.bottom > window.innerHeight - 8) nextPos = 'top';
      else if (position === 'left' && rect.left < 8) nextPos = 'right';
      else if (position === 'right' && rect.right > window.innerWidth - 8) nextPos = 'left';

      setActualPos(nextPos);
    } else {
      setActualPos(position);
    }
  }, [visible, position]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  if (!content) return <>{children}</>;

  return (
    <div
      ref={wrapperRef}
      className={`tip-wrapper ${className}`}
      style={style}
      onMouseEnter={showTip}
      onMouseLeave={hideTip}
      onFocus={showTip}
      onBlur={hideTip}
      onClick={toggleTap}
      aria-describedby={visible ? tooltipId : undefined}
    >
      {children}
      {visible && (
        <div
          ref={bubbleRef}
          id={tooltipId}
          role="tooltip"
          className={`tip-bubble tip-bubble--${actualPos} ${visible ? 'tip-bubble--visible' : ''}`}
        >
          {content}
        </div>
      )}
    </div>
  );
}
