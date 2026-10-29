// Food item SVG illustrations — flat, hand-drawn style

import React from 'react';

const STROKE = '#1D1F1E';
const SW = 1.5;

// Steel dabba (container) — open top view showing food
export function SteelDabba({
  variant = 'dal',
  size = 40,
}: {
  variant?: 'dal' | 'rice' | 'curry' | 'paneer';
  size?: number;
}) {
  const fills: Record<string, string> = {
    dal: '#B5834A',
    rice: '#EDE3C8',
    curry: '#C4973A',
    paneer: '#F0E6C0',
  };
  const lidColor = '#C8C6C0';
  const bodyColor = '#D8D6D0';
  const fill = fills[variant] || fills.dal;

  return (
    <svg viewBox="0 0 40 40" width={size} height={size}>
      {/* Container body */}
      <rect x="3" y="8" width="34" height="28" rx="3" fill={bodyColor} stroke={STROKE} strokeWidth={SW} />
      {/* Food inside */}
      <rect x="5" y="10" width="30" height="24" rx="2" fill={fill} />
      {/* Surface detail */}
      {variant === 'rice' && (
        <>
          <circle cx="12" cy="20" r="1.5" fill="#F8F5EE" />
          <circle cx="20" cy="16" r="1.5" fill="#F8F5EE" />
          <circle cx="28" cy="22" r="1.5" fill="#F8F5EE" />
          <circle cx="16" cy="28" r="1.5" fill="#F8F5EE" />
          <circle cx="24" cy="26" r="1.5" fill="#F8F5EE" />
        </>
      )}
      {variant === 'dal' && (
        <>
          <ellipse cx="15" cy="22" rx="4" ry="2" fill="rgba(29,31,30,0.12)" />
          <circle cx="20" cy="18" r="2" fill="#C89050" />
        </>
      )}
      {variant === 'curry' && (
        <>
          <circle cx="14" cy="18" r="3" fill="#8A5A20" />
          <circle cx="24" cy="24" r="2.5" fill="#7A8A30" />
          <circle cx="20" cy="20" r="2" fill="#A04030" />
        </>
      )}
      {variant === 'paneer' && (
        <>
          <rect x="10" y="14" width="6" height="6" rx="1" fill="#F8F5EE" />
          <rect x="20" y="18" width="6" height="6" rx="1" fill="#F8F5EE" />
          <rect x="14" y="24" width="6" height="4" rx="1" fill="#F8F5EE" />
        </>
      )}
      {/* Lid on top edge */}
      <rect x="2" y="5" width="36" height="6" rx="2" fill={lidColor} stroke={STROKE} strokeWidth={SW} />
      <rect x="14" y="2" width="12" height="5" rx="2" fill={lidColor} stroke={STROKE} strokeWidth={SW * 0.7} />
    </svg>
  );
}

// Milk carton
export function MilkCarton({ size = 40 }: { size?: number }) {
  return (
    <svg viewBox="0 0 40 56" width={size} height={(size * 56) / 40}>
      {/* Body */}
      <rect x="6" y="18" width="28" height="34" rx="2" fill="#F8F5EE" stroke={STROKE} strokeWidth={SW} />
      {/* Gable top */}
      <polygon points="6,18 20,6 34,18" fill="#E8E5E0" stroke={STROKE} strokeWidth={SW} />
      {/* Brand label */}
      <rect x="8" y="26" width="24" height="18" rx="1" fill="#E0EBF0" />
      <text x="20" y="37" textAnchor="middle" fontSize="5" fill="#1D1F1E" fontFamily="sans-serif">MILK</text>
      <text x="20" y="43" textAnchor="middle" fontSize="4" fill="#6B6F6C" fontFamily="monospace">1 L</text>
    </svg>
  );
}

// Curd bowl
export function CurdBowl({ size = 40 }: { size?: number }) {
  return (
    <svg viewBox="0 0 44 32" width={size} height={(size * 32) / 44}>
      {/* Bowl */}
      <ellipse cx="22" cy="20" rx="20" ry="10" fill="#D8D6D0" stroke={STROKE} strokeWidth={SW} />
      <ellipse cx="22" cy="18" rx="18" ry="8" fill="#F0EEE8" />
      {/* Curd surface */}
      <ellipse cx="22" cy="17" rx="14" ry="5" fill="#EEECE6" />
      <ellipse cx="18" cy="16" rx="4" ry="2" fill="rgba(255,255,255,0.5)" />
    </svg>
  );
}

// Batter container (tall, with fill line)
export function BatterContainer({
  fillFraction = 0.6,
  size = 40,
}: {
  fillFraction?: number;
  size?: number;
}) {
  const h = 64;
  const bodyStart = 6;
  const bodyH = h - 10;
  const fillH = bodyH * fillFraction;
  const fillY = bodyStart + bodyH - fillH;

  return (
    <svg viewBox="0 0 36 64" width={size} height={(size * h) / 36}>
      {/* Body */}
      <rect x="4" y={bodyStart} width="28" height={bodyH} rx="3" fill="#E8E5E0" stroke={STROKE} strokeWidth={SW} />
      {/* Fill */}
      <rect x="5" y={fillY} width="26" height={fillH} rx="2" fill="#D4C8A8" />
      {/* Fill level line */}
      <line x1="4" y1={fillY} x2="32" y2={fillY} stroke={STROKE} strokeWidth="1" strokeDasharray="3,2" />
      {/* Lid */}
      <rect x="2" y="3" width="32" height="6" rx="2" fill="#C8C6C0" stroke={STROKE} strokeWidth={SW * 0.8} />
      {/* Bubbles (batter fermenting) */}
      <circle cx="14" cy={fillY + 4} r="1.5" fill="rgba(29,31,30,0.2)" />
      <circle cx="22" cy={fillY + 6} r="1" fill="rgba(29,31,30,0.15)" />
      <circle cx="18" cy={fillY + 3} r="1" fill="rgba(29,31,30,0.15)" />
    </svg>
  );
}

// Egg tray (top view)
export function EggTray({ size = 50 }: { size?: number }) {
  const eggs = [
    [12, 12], [24, 12], [36, 12], [48, 12],
    [12, 26], [24, 26], [36, 26], [48, 26],
    [12, 40], [24, 40], [36, 40], [48, 40],
  ];
  return (
    <svg viewBox="0 0 60 52" width={size} height={(size * 52) / 60}>
      <rect x="2" y="2" width="56" height="48" rx="3" fill="#E8E5DE" stroke={STROKE} strokeWidth={SW} />
      {eggs.map(([cx, cy], i) => (
        <ellipse key={i} cx={cx} cy={cy} rx="6" ry="7" fill="#F4F0E0" stroke="#B0AEA8" strokeWidth="0.75" />
      ))}
    </svg>
  );
}

// Leafy greens bag
export function GreensBag({
  browning = 0,
  size = 44,
}: {
  browning?: number;
  size?: number;
}) {
  return (
    <svg viewBox="0 0 44 54" width={size} height={(size * 54) / 44}>
      {/* Bag */}
      <rect x="4" y="10" width="36" height="40" rx="4" fill="#D0E8C0" stroke={STROKE} strokeWidth={SW} />
      {/* Tie */}
      <rect x="14" y="4" width="16" height="8" rx="3" fill="transparent" stroke={STROKE} strokeWidth={SW} />
      <line x1="22" y1="4" x2="22" y2="2" stroke={STROKE} strokeWidth={SW} />
      {/* Greens visible */}
      <ellipse cx="16" cy="28" rx="8" ry="10" fill="#5A8A4A" />
      <ellipse cx="28" cy="24" rx="8" ry="9" fill="#4A7A3A" />
      <ellipse cx="22" cy="36" rx="7" ry="8" fill="#6A9A5A" />
      {/* Browning overlay */}
      {browning > 0 && (
        <>
          <ellipse cx="16" cy="28" rx={8 * browning} ry={6 * browning}
            fill="rgba(139,90,43,0.6)" />
          <circle cx="28" cy="30" r={5 * browning} fill="rgba(139,90,43,0.5)" />
        </>
      )}
    </svg>
  );
}

// Tomatoes and onions
export function TomatoOnion({ size = 44 }: { size?: number }) {
  return (
    <svg viewBox="0 0 54 36" width={size} height={(size * 36) / 54}>
      {/* Tomatoes */}
      <circle cx="12" cy="20" r="10" fill="#C04535" stroke={STROKE} strokeWidth={SW} />
      <circle cx="22" cy="16" r="9" fill="#B83C2C" stroke={STROKE} strokeWidth={SW} />
      {/* Stems */}
      <line x1="12" y1="10" x2="12" y2="6" stroke="#5A8A4A" strokeWidth="1.5" />
      <line x1="22" y1="7" x2="22" y2="4" stroke="#5A8A4A" strokeWidth="1.5" />
      {/* Onions */}
      <ellipse cx="40" cy="22" rx="11" ry="9" fill="#D4A060" stroke={STROKE} strokeWidth={SW} />
      <ellipse cx="46" cy="18" rx="8" ry="7" fill="#C89050" stroke={STROKE} strokeWidth={SW} />
      {/* Onion lines */}
      <path d="M36,20 Q40,14 44,20" fill="none" stroke="rgba(29,31,30,0.2)" strokeWidth="0.75" />
      <path d="M38,24 Q42,18 46,24" fill="none" stroke="rgba(29,31,30,0.2)" strokeWidth="0.75" />
    </svg>
  );
}

// Cooked chicken in dish
export function CookedChicken({ size = 46 }: { size?: number }) {
  return (
    <svg viewBox="0 0 54 42" width={size} height={(size * 42) / 54}>
      {/* Dish */}
      <ellipse cx="27" cy="30" rx="25" ry="10" fill="#C8C6C0" stroke={STROKE} strokeWidth={SW} />
      <ellipse cx="27" cy="28" rx="23" ry="8" fill="#E0DEDA" />
      {/* Chicken pieces */}
      <ellipse cx="20" cy="24" rx="12" ry="8" fill="#C8A070" stroke={STROKE} strokeWidth={SW} />
      <ellipse cx="34" cy="22" rx="10" ry="7" fill="#B89060" stroke={STROKE} strokeWidth={SW} />
      {/* Browning detail */}
      <ellipse cx="20" cy="23" rx="7" ry="4" fill="#A07040" />
      <ellipse cx="34" cy="21" rx="5" ry="3" fill="#907030" />
    </svg>
  );
}

// Insulin pen
export function InsulinPen({ size = 36 }: { size?: number }) {
  return (
    <svg viewBox="0 0 100 18" width={size} height={(size * 18) / 100}>
      {/* Pen body */}
      <rect x="2" y="4" width="80" height="10" rx="5" fill="#E0EBF0" stroke={STROKE} strokeWidth={SW} />
      {/* Needle cap */}
      <rect x="82" y="6" width="14" height="6" rx="2" fill="#C0D0D8" stroke={STROKE} strokeWidth={SW * 0.8} />
      {/* Dial */}
      <circle cx="30" cy="9" r="4" fill="#D0E4EC" stroke={STROKE} strokeWidth="0.75" />
      <text x="30" y="12" textAnchor="middle" fontSize="4" fill="#1D1F1E" fontFamily="monospace">14</text>
      {/* Window */}
      <rect x="45" y="5" width="18" height="8" rx="2" fill="rgba(255,255,255,0.6)" stroke={STROKE} strokeWidth="0.5" />
    </svg>
  );
}

// Insulin vial
export function InsulinVial({ size = 28 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 48" width={size} height={(size * 48) / 24}>
      {/* Vial body */}
      <rect x="4" y="12" width="16" height="32" rx="3" fill="#E8F4F8" stroke={STROKE} strokeWidth={SW} />
      {/* Cap */}
      <rect x="6" y="4" width="12" height="10" rx="2" fill="#C0D8E0" stroke={STROKE} strokeWidth={SW * 0.8} />
      {/* Liquid level */}
      <rect x="5" y="24" width="14" height="18" rx="2" fill="#D0EAF0" />
      {/* Label */}
      <rect x="6" y="16" width="12" height="12" rx="1" fill="rgba(255,255,255,0.7)" />
      <text x="12" y="23" textAnchor="middle" fontSize="3.5" fill="#1D1F1E" fontFamily="monospace">INS</text>
    </svg>
  );
}

// Top-down plate illustration
export function TopDownPlate({
  size = 80,
  variant = 'dal-rice',
  phase = 'before',
}: {
  size?: number;
  variant?: 'dal-rice' | 'sabzi-roti';
  phase?: 'before' | 'after';
}) {
  const remaining = phase === 'after' ? 0.35 : 1;
  return (
    <svg viewBox="0 0 80 80" width={size} height={size}>
      {/* Plate rim */}
      <circle cx="40" cy="40" r="38" fill="#D8D6D0" stroke={STROKE} strokeWidth={SW} />
      <circle cx="40" cy="40" r="34" fill="#E8E6E0" />
      {variant === 'dal-rice' && (
        <>
          {/* Rice portion */}
          <path d="M40,40 L40,10 A30,30 0 0,1 70,40 Z" fill="#EDE3C8" opacity={remaining} />
          {/* Dal portion */}
          <path d="M40,40 L70,40 A30,30 0 0,1 40,70 Z" fill="#B5834A" opacity={remaining} />
          {/* Curry */}
          <path d="M40,40 L40,70 A30,30 0 0,1 10,40 Z" fill="#C4973A" opacity={remaining} />
          {/* Sabzi */}
          <path d="M40,40 L10,40 A30,30 0 0,1 40,10 Z" fill="#5A8A4A" opacity={remaining} />
        </>
      )}
      {variant === 'sabzi-roti' && (
        <>
          {/* Roti */}
          <ellipse cx="32" cy="34" rx="14" ry="12" fill="#D4B880" opacity={remaining} />
          <ellipse cx="48" cy="48" rx="12" ry="10" fill="#C8AA70" opacity={remaining} />
          {/* Sabzi */}
          <ellipse cx="52" cy="30" rx="10" ry="10" fill="#5A8A4A" opacity={remaining} />
        </>
      )}
      {/* Empty ring visible in after state */}
      {phase === 'after' && (
        <circle cx="40" cy="40" r="34" fill="none" stroke="#C8C6C0" strokeWidth="0.5" />
      )}
    </svg>
  );
}

// Water bottle
export function WaterBottle({ size = 40 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 60" width={size} height={(size * 60) / 24}>
      {/* Bottle body */}
      <rect x="4" y="18" width="16" height="38" rx="4" fill="#D0EAF8" stroke={STROKE} strokeWidth={SW} />
      {/* Neck */}
      <rect x="8" y="8" width="8" height="12" rx="2" fill="#C0D8E8" stroke={STROKE} strokeWidth={SW * 0.8} />
      {/* Cap */}
      <rect x="7" y="4" width="10" height="6" rx="2" fill="#5C7A8C" stroke={STROKE} strokeWidth={SW * 0.7} />
      {/* Water level */}
      <rect x="5" y="36" width="14" height="19" rx="3" fill="#B0D8F0" opacity="0.7" />
      {/* Label */}
      <rect x="5" y="26" width="14" height="8" rx="1" fill="rgba(255,255,255,0.5)" />
    </svg>
  );
}

// Retrofit kit parts — simplified parts list
export function RetrofitKit({ size = 200 }: { size?: number }) {
  return (
    <svg viewBox="0 0 200 120" width={size} height={(size * 120) / 200}>
      {/* Load cell */}
      <rect x="8" y="8" width="36" height="20" rx="3" fill="#E0DEDA" stroke={STROKE} strokeWidth={SW} />
      <text x="26" y="22" textAnchor="middle" fontSize="5" fill="#6B6F6C" fontFamily="monospace">Load cell</text>
      <rect x="14" y="14" width="8" height="8" rx="1" fill="#B8B6B0" />

      {/* Camera */}
      <rect x="58" y="8" width="36" height="24" rx="3" fill="#2A2C2B" stroke={STROKE} strokeWidth={SW} />
      <circle cx="76" cy="20" r="7" fill="#1D1F1E" stroke="#5C7A8C" strokeWidth="1" />
      <circle cx="76" cy="20" r="3" fill="#0A0C0B" />
      <text x="76" y="40" textAnchor="middle" fontSize="5" fill="#6B6F6C" fontFamily="monospace">Camera</text>

      {/* Temp sensor */}
      <rect x="108" y="10" width="28" height="18" rx="3" fill="#E0EBF0" stroke={STROKE} strokeWidth={SW} />
      <circle cx="122" cy="19" r="5" fill="#5C7A8C" stroke={STROKE} strokeWidth="0.75" />
      <text x="122" y="36" textAnchor="middle" fontSize="5" fill="#6B6F6C" fontFamily="monospace">Sensor</text>

      {/* Hub */}
      <rect x="150" y="6" width="42" height="28" rx="3" fill="#D8D6D0" stroke={STROKE} strokeWidth={SW} />
      <rect x="155" y="10" width="6" height="6" rx="1" fill="#2F6F5E" />
      <rect x="163" y="10" width="6" height="6" rx="1" fill="#9E9C98" />
      <rect x="171" y="10" width="6" height="6" rx="1" fill="#9E9C98" />
      <text x="171" y="42" textAnchor="middle" fontSize="5" fill="#6B6F6C" fontFamily="monospace">Hub</text>

      {/* Connection lines */}
      <line x1="44" y1="18" x2="58" y2="18" stroke="#B8B6B0" strokeWidth="0.75" strokeDasharray="2,2" />
      <line x1="94" y1="20" x2="108" y2="20" stroke="#B8B6B0" strokeWidth="0.75" strokeDasharray="2,2" />
      <line x1="136" y1="19" x2="150" y2="19" stroke="#B8B6B0" strokeWidth="0.75" strokeDasharray="2,2" />
    </svg>
  );
}
