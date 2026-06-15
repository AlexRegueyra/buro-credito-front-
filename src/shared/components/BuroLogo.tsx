interface BuroLogoProps {
  /** Variante oscura: rellenos blancos (para navbar dark). Default: false (guinda, para sidebar claro) */
  dark?: boolean;
  height?: number;
  className?: string;
}

export function BuroLogo({ dark = false, height = 42, className }: BuroLogoProps) {
  const color = dark ? '#ffffff' : '#9B2247';
  const shadowOpacity = dark ? 0.35 : 0;
  const scale = height / 50;
  const width = Math.round(320 * scale);

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 320 50"
      className={className}
      aria-label="Buró de Crédito"
      role="img"
    >
      {shadowOpacity > 0 && (
        <defs>
          <filter id="buro-shadow">
            <feDropShadow dx="1" dy="1" stdDeviation="1" floodOpacity={shadowOpacity} />
          </filter>
        </defs>
      )}

      {/* Icono reloj */}
      <g transform="translate(8,8)">
        <circle
          cx="17" cy="17" r="15"
          fill="none"
          stroke={color}
          strokeWidth="2.5"
        />
        <path
          d="M17 8 L17 17 L24 21"
          stroke={color}
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
        />
      </g>

      {/* Texto */}
      <text
        x="50"
        y="34"
        fontFamily="Arial, Helvetica, sans-serif"
        fontSize="28"
        fontWeight="700"
        fill={color}
        filter={shadowOpacity > 0 ? 'url(#buro-shadow)' : undefined}
        letterSpacing="-0.3"
      >
        Buró de Crédito
      </text>
    </svg>
  );
}
