export function MaividaLogo() {
  return (
    <svg
      className="brand-logo"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 400 56"
      width="100%"
      height="100%"
      role="img"
      aria-label="MAIVIDA Carbide Cutting Tools"
      focusable="false"
      preserveAspectRatio="xMinYMid meet"
    >
      <g transform="translate(4, 6)">
        <polygon points="8,0 44,0 44,36 36,44 0,44 0,8" fill="#181A1F" />
        <path d="M9 34 V12 L22 24 L35 12 V34 H29 V22 L22 28.5 L15 22 V34 Z" fill="#FFFFFF" />
        <polygon points="34,0 44,0 44,10" fill="#A8B0B8" />
        <circle cx="22" cy="12" r="2.8" fill="#E8621A" />
      </g>

      <g transform="translate(60, 36)">
        <text
          x="0"
          y="0"
          fontFamily="'Helvetica Neue', Arial, sans-serif"
          fontWeight={800}
          fontSize="24"
          letterSpacing="2"
          fill="#181A1F"
        >
          MAIVIDA
        </text>
      </g>

      <line x1="192" y1="12" x2="198" y2="44" stroke="#D1D5DB" strokeWidth="1.5" />

      <g transform="translate(208, 26)">
        <circle cx="3" cy="-3.5" r="2.3" fill="#E8621A" />
        <text
          x="10"
          y="0"
          fontFamily="'Helvetica Neue', Arial, sans-serif"
          fontWeight={700}
          fontSize="10"
          letterSpacing="0.8"
          fill="#181A1F"
        >
          CARBIDE CUTTING TOOLS
        </text>
        <text
          x="0"
          y="13"
          fontFamily="'Helvetica Neue', Arial, sans-serif"
          fontWeight={500}
          fontSize="8.5"
          letterSpacing="1"
          fill="#6B7280"
        >
          PRECISION MACHINING // ISO
        </text>
      </g>
    </svg>
  );
}
