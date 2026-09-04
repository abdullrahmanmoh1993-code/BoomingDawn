interface LogoProps {
  className?: string;
  width?: number;
  height?: number;
}

/**
 * The Booming Dawn brand mark — scalable SVG recreation of the raster logo.
 * Always rendered in brand red (#bb2329) on the site's pure black background.
 * Structure (top to bottom): 3 sunburst rays, arched English wordmark,
 * Arabic name, crescent.
 */
export function Logo({ className, width = 200, height = 200 }: LogoProps) {
  return (
    <svg
      viewBox="0 10 200 150"
      width={width}
      height={height}
      className={className}
      role="img"
      aria-label="The Booming Dawn logo"
    >
      <defs>
        <path id="arch" d="M 10 110 Q 100 10 190 110" />
      </defs>

      {/* 1. Sunburst rays — 3 thick bars, fanned ±30deg around (100, 40) */}
      <g transform="rotate(0 100 40)">
        <rect x="96" y="16" width="8" height="24" fill="#bb2329" />
      </g>
      <g transform="rotate(-30 100 40)">
        <rect x="96" y="16" width="8" height="24" fill="#bb2329" />
      </g>
      <g transform="rotate(30 100 40)">
        <rect x="96" y="16" width="8" height="24" fill="#bb2329" />
      </g>

      {/* 2. Arched English wordmark */}
      <text
        fill="#bb2329"
        fontFamily="'CoupDePoker', 'Anton', 'Impact', sans-serif"
        fontWeight="800"
        fontSize="18"
        letterSpacing="2"
      >
        <textPath href="#arch" startOffset="50%" textAnchor="middle">
          THE BOOMING DAWN
        </textPath>
      </text>

      {/* 3. Arabic name */}
      <text
        x="100"
        y="115"
        fill="#bb2329"
        fontFamily="'beirut', 'Cairo', sans-serif"
        fontWeight="700"
        fontSize="22"
        textAnchor="middle"
        direction="rtl"
      >
        الفجر الصاخب
      </text>

      {/* 4. Crescent */}
      <path d="M 75 135 Q 100 155 125 135 Q 100 145 75 135" fill="#bb2329" />
    </svg>
  );
}