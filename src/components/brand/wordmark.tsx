import Link from "next/link";
import { LogoMark } from "@/components/brand/logo-mark";
import { cn } from "@/lib/utils";

/**
 * The Holicruit lockup: the whole-person mark + the wordmark (Instrument Serif,
 * lowercase, with the "i" in terracotta).
 */
export function Wordmark({
  href = "/",
  className,
  markSize = 22,
  showMark = true,
}: {
  href?: string;
  className?: string;
  markSize?: number;
  showMark?: boolean;
}) {
  return (
    <Link href={href} className={cn("inline-flex items-center gap-1.5", className)}>
      {showMark && <LogoMark size={markSize} />}
      <span className="font-serif text-xl lowercase tracking-tight text-foreground">
        hol<span className="text-primary">i</span>cruit
      </span>
    </Link>
  );
}
