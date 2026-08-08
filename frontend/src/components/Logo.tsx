import type { SVGProps } from "react";

/**
 * Nominal pixel sizes for the mark. Exported so callers reference the scale
 * rather than duplicating magic numbers.
 */
export const LOGO_SIZES = {
  sm: 24,
  md: 32,
  lg: 48,
  xl: 64,
} as const;

/**
 * Brand values, kept here for migration and for anywhere CSS variables can't
 * reach (manifest files, meta tags, email templates).
 */
export const BRAND = {
  /** M-Pesa gold — the streams and the outgoing route. */
  accent: "#C8860A",
  /** Forest green — the app icon plate. */
  plate: "#0A1F10",
  /** Knocked-out hub on dark backgrounds. */
  surface: "#F5F1E8",
} as const;

export type LogoSize = keyof typeof LOGO_SIZES;

export interface LogoProps extends Omit<SVGProps<SVGSVGElement>, "color"> {
  /** Preset size, or an explicit pixel value. @default "md" */
  size?: LogoSize | number;
  /**
   * `mark` is the bare logo. `icon` adds the forest plate and knocks the hub
   * out light — use it for favicons, PWA icons and app store assets.
   * @default "mark"
   */
  variant?: "mark" | "icon";
  /**
   * Straight streams instead of curved ones. The curves lose definition below
   * roughly 24px; this variant holds. Applied automatically when `size` is a
   * number under 24, so you only set it by hand when sizing via CSS.
   */
  compact?: boolean;
  /** Knock the hub out light without drawing a plate — for dark or photographic backgrounds. */
  inverted?: boolean;
  /** Override the stream colour. Defaults to `--logo-accent`, falling back to the brand gold. */
  accent?: string;
  /**
   * Accessible name. Omit for decorative use — e.g. beside a visible wordmark
   * inside the same link — and the mark is hidden from assistive technology.
   */
  label?: string;
}

/** Curved streams: three sellers converging on the hub. */
const STREAMS_FULL = [
  "M4 10C20 10 20 32 28 32",
  "M4 32H28",
  "M4 54C20 54 20 32 28 32",
];

/** Straight streams, for small sizes. */
const STREAMS_COMPACT = ["M9 15L26 29", "M9 32H26", "M9 49L26 35"];

export function Logo({
  size = "md",
  variant = "mark",
  compact,
  inverted = false,
  accent,
  label,
  ...props
}: LogoProps) {
  const dimension = typeof size === "number" ? size : LOGO_SIZES[size];
  const isCompact = compact ?? dimension < 24;
  const isIcon = variant === "icon";

  const streamColor = accent ?? `var(--logo-accent, ${BRAND.accent})`;
  const hubColor =
    isIcon || inverted ? `var(--logo-surface, ${BRAND.surface})` : "currentColor";

  const streams = isCompact ? STREAMS_COMPACT : STREAMS_FULL;
  const strokeWidth = isCompact ? 6.5 : 5;
  const hubX = isCompact ? 22 : 24;
  const tail = isCompact ? "M46 32H58" : "M48 32H60";

  return (
    <svg
      width={dimension}
      height={dimension}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role={label ? "img" : undefined}
      aria-hidden={label ? undefined : true}
      focusable="false"
      {...props}
    >
      {label ? <title>{label}</title> : null}

      {isIcon ? (
        <rect
          width="64"
          height="64"
          rx="14"
          fill={`var(--logo-plate, ${BRAND.plate})`}
        />
      ) : null}

      <g
        stroke={streamColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {streams.map((d) => (
          <path key={d} d={d} />
        ))}
        <path d={tail} />
      </g>

      {/* The hub, drawn last so the streams tuck beneath it */}
      <rect x={hubX} y="20" width="24" height="24" rx="7" fill={hubColor} />
    </svg>
  );
}

export interface LogoLockupProps {
  /** Mark size in pixels; the wordmark scales alongside it. @default 32 */
  size?: LogoSize | number;
  inverted?: boolean;
  className?: string;
  /**
   * Rendered as a heading rather than a plain container. Set this only for the
   * single lockup that acts as the page's main heading.
   */
  as?: "div" | "h1";
}

/**
 * Mark plus wordmark. The mark is decorative here because the wordmark already
 * supplies the accessible text — announcing both would repeat it.
 */
export function LogoLockup({
  size = 32,
  inverted = false,
  className,
  as: Tag = "div",
}: LogoLockupProps) {
  const dimension = typeof size === "number" ? size : LOGO_SIZES[size];

  return (
    <Tag className={`flex items-center gap-2.5 ${className ?? ""}`}>
      <Logo size={dimension} inverted={inverted} />
      <span
        className="font-medium tracking-tight"
        style={{ fontSize: dimension * 0.62 }}
      >
        Nyakizu
      </span>
    </Tag>
  );
}