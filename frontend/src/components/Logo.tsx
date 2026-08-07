import { SVGProps } from "react";

interface LogoProps extends SVGProps<SVGSVGElement> {
  size?: "sm" | "md" | "lg";
  inverted?: boolean;
  /** Override the mark's color — defaults to brand blue. Used on the warm-toned landing page. */
  color?: string;
}

const sizeMap = {
  sm: 32,
  md: 40,
  lg: 64,
};

export function Logo({ size = "md", inverted = false, color, ...props }: LogoProps) {
  const dimension = sizeMap[size];
  const accentColor = color ?? "#2563EB";

  return (
    <svg
      width={dimension}
      height={dimension}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      {/* Icon: Stylized "N" with ledger lines */}
      <rect width="64" height="64" rx="12" fill={accentColor} fillOpacity="0.1" />
      
      {/* Vertical line - left */}
      <rect x="16" y="14" width="3" height="36" fill={accentColor} />
      
      {/* Diagonal line */}
      <line x1="22" y1="14" x2="42" y2="50" stroke={accentColor} strokeWidth="3" strokeLinecap="round" />
      
      {/* Vertical line - right */}
      <rect x="45" y="14" width="3" height="36" fill={accentColor} />
      
      {/* Horizontal ledger lines */}
      <line x1="14" y1="24" x2="50" y2="24" stroke={accentColor} strokeWidth="1.5" opacity="0.5" />
      <line x1="14" y1="32" x2="50" y2="32" stroke={accentColor} strokeWidth="1.5" opacity="0.5" />
      <line x1="14" y1="40" x2="50" y2="40" stroke={accentColor} strokeWidth="1.5" opacity="0.5" />
    </svg>
  );
}