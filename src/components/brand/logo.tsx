interface LogoProps {
  size?: number;
  className?: string;
}

export function LogoMark({ size = 32, className }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Holicruit logo"
      role="img"
    >
      {/* Dark rounded square */}
      <rect width="100" height="100" rx="22" fill="#1E1D1C" />
      {/* Cream left arc */}
      <path
        d="M42 78.5a30 30 0 0 1 0-57"
        stroke="#F4EFE7"
        strokeWidth="11"
        strokeLinecap="round"
      />
      {/* Coral right arc */}
      <path
        d="M58 21.5a30 30 0 0 1 0 57"
        stroke="#E0533D"
        strokeWidth="11"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function LogoFull({ size = 32, className }: LogoProps) {
  return (
    <span className={`inline-flex items-center gap-2 ${className ?? ""}`}>
      <LogoMark size={size} />
      <span
        className="font-bold tracking-tight"
        style={{ fontSize: size * 0.65, lineHeight: 1 }}
      >
        holicruit
      </span>
    </span>
  );
}
