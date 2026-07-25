import { cn } from "@/lib/utils";

/**
 * Holicruit logo mark — three overlapping rounded squares (terracotta, sage,
 * amber): the layered "whole person". Matches the marketing landing exactly.
 */
export function LogoMark({ size = 24, className }: { size?: number; className?: string }) {
  return (
    <svg
      viewBox="0 0 26 26"
      width={size}
      height={size}
      fill="none"
      className={cn("shrink-0", className)}
      aria-hidden
    >
      <rect x="3" y="3" width="13" height="13" rx="4" fill="#C75B39" />
      <rect
        x="10"
        y="7"
        width="13"
        height="13"
        rx="4"
        fill="#7C8B6B"
        opacity="0.82"
        style={{ mixBlendMode: "multiply" }}
      />
      <rect
        x="6.5"
        y="10"
        width="10"
        height="10"
        rx="3.4"
        fill="#E6A15C"
        opacity="0.85"
        style={{ mixBlendMode: "multiply" }}
      />
    </svg>
  );
}
