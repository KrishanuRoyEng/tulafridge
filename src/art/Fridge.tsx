// Hand-drawn flat SVG illustrations — fridge exterior

import React from 'react';

interface FridgeExteriorProps {
  width?: number;
  height?: number;
  doorOpen?: boolean;
  screenActive?: boolean;
}

export function FridgeExterior({ width = 240, height = 480, doorOpen = false, screenActive = false }: FridgeExteriorProps) {
  const scaleX = width / 240;
  const scaleY = height / 480;

  return (
    <svg
      viewBox="0 0 240 480"
      width={width}
      height={height}
      style={{ display: 'block' }}
      aria-label="Tula refrigerator exterior"
    >
      {/* Floor shadow */}
      <ellipse cx="120" cy="475" rx="100" ry="6" fill="rgba(29,31,30,0.12)" />

      {/* Main body */}
      <rect x="18" y="4" width="204" height="466" rx="8" fill="#C8C6C0" />
      <rect x="20" y="6" width="200" height="462" rx="7" fill="#D8D6D0" />

      {/* Steel texture — subtle two-stop fill (top lighter) */}
      <rect x="20" y="6" width="200" height="230" rx="7" fill="#E0DEDA" />
      <rect x="20" y="234" width="200" height="234" rx="0" fill="#D0CEC8" />
      <rect x="20" y="460" width="200" height="8" rx="4" fill="#C8C6C0" />

      {/* Handle seam line top door */}
      <line x1="20" y1="310" x2="220" y2="310" stroke="#B8B6B0" strokeWidth="1.5" />

      {/* Hinge strip between top and bottom */}
      <rect x="18" y="305" width="204" height="10" rx="2" fill="#B8B6B0" />

      {/* Top door handle */}
      <rect x="190" y="100" width="8" height="80" rx="4" fill="#9E9C98" />
      <rect x="191" y="101" width="5" height="78" rx="3" fill="#AEACAa" />

      {/* Bottom door handle */}
      <rect x="190" y="370" width="8" height="60" rx="4" fill="#9E9C98" />

      {/* Logo/brand area */}
      <rect x="35" y="24" width="60" height="16" rx="2" fill="rgba(29,31,30,0.06)" />
      <text x="65" y="35" textAnchor="middle" fontSize="9" fontFamily="'Schibsted Grotesk',sans-serif"
        fill="#6B6F6C" fontWeight="500" letterSpacing="2">TULA</text>

      {/* Door screen — flush rectangular display */}
      <rect
        x="32"
        y="50"
        width="110"
        height="70"
        rx="4"
        fill={screenActive ? '#1D1F1E' : '#161816'}
        stroke="#9E9C98"
        strokeWidth="0.75"
      />
      {/* Screen content when not active */}
      {!screenActive && (
        <>
          <rect x="38" y="62" width="30" height="3" rx="1.5" fill="#3A3C3B" />
          <rect x="38" y="70" width="50" height="2" rx="1" fill="#2A2C2B" />
          <rect x="38" y="76" width="40" height="2" rx="1" fill="#2A2C2B" />
          <circle cx="120" cy="70" r="8" fill="none" stroke="#2F6F5E" strokeWidth="1" />
          <text x="120" y="73" textAnchor="middle" fontSize="6" fill="#2F6F5E" fontFamily="monospace">4.0°</text>
        </>
      )}

      {/* Ventilation grille top */}
      {[0,1,2,3,4].map(i => (
        <line key={i} x1="25" y1={12 + i * 3} x2="215" y2={12 + i * 3}
          stroke="#B0AEA8" strokeWidth="0.5" />
      ))}

      {/* Bottom freezer door detail */}
      <rect x="24" y="316" width="192" height="150" rx="4" fill="#D0CEC8" />
      <rect x="24" y="316" width="192" height="4" rx="2" fill="#C0BEBC" />

      {/* Foot pegs */}
      <rect x="35" y="466" width="20" height="8" rx="2" fill="#9E9C98" />
      <rect x="185" y="466" width="20" height="8" rx="2" fill="#9E9C98" />
    </svg>
  );
}

// Fridge interior illustration
export function FridgeInterior({ width = 320, height = 400 }: { width?: number; height?: number }) {
  return (
    <svg viewBox="0 0 320 400" width={width} height={height} aria-label="Fridge interior">
      {/* Interior walls */}
      <rect x="0" y="0" width="320" height="400" fill="#E8E6E0" />
      <rect x="0" y="0" width="8" height="400" fill="#D0CECC" />
      <rect x="312" y="0" width="8" height="400" fill="#D0CECC" />
      <rect x="0" y="0" width="320" height="6" fill="#D0CECC" />
      <rect x="0" y="394" width="320" height="6" fill="#C8C6C0" />

      {/* Shelves */}
      {/* Shelf 3 — top */}
      <rect x="8" y="85" width="304" height="4" rx="1" fill="#B8B6B0" />
      {/* Shelf 2 — middle */}
      <rect x="8" y="185" width="304" height="4" rx="1" fill="#B8B6B0" />
      {/* Shelf 1 — lower */}
      <rect x="8" y="285" width="304" height="4" rx="1" fill="#B8B6B0" />

      {/* Shelf labels */}
      <text x="12" y="24" fontSize="8" fill="#9E9C98" fontFamily="monospace">Shelf 3</text>
      <text x="12" y="124" fontSize="8" fill="#9E9C98" fontFamily="monospace">Shelf 2</text>
      <text x="12" y="224" fontSize="8" fill="#9E9C98" fontFamily="monospace">Shelf 1</text>
      <text x="12" y="324" fontSize="8" fill="#9E9C98" fontFamily="monospace">Crisper</text>

      {/* Medicine zone marker */}
      <rect x="262" y="8" width="50" height="70" rx="2" fill="rgba(92,122,140,0.08)" stroke="#5C7A8C" strokeWidth="0.75" strokeDasharray="3,2" />
      <text x="287" y="18" fontSize="6" fill="#5C7A8C" fontFamily="monospace" textAnchor="middle">Med</text>

      {/* Door bin area on right (simplified) */}
      <rect x="260" y="90" width="52" height="90" rx="2" fill="rgba(200,198,192,0.4)" stroke="#B8B6B0" strokeWidth="0.5" />

      {/* Crisper drawer */}
      <rect x="8" y="290" width="304" height="95" rx="2" fill="rgba(200,198,192,0.3)" stroke="#B8B6B0" strokeWidth="0.75" />
    </svg>
  );
}
