import Link from "next/link";
import { LogoMark } from "@/components/brand/logo-mark";
import { cn } from "@/lib/utils";

/**
 * The Holicruit lockup: the whole-person mark + the wordmark (Instrument Serif,
 * lowercase). One consistent color, matching the landing page.
 */
export function Wordmark({
  href = "/",
  className,
  markSize = 30,
  showMark = true,
}: {
  href?: string;
  className?: string;
  markSize?: number;
  showMark?: boolean;
}) {
  return (
    <Link href={href} className={cn("inline-flex items-center gap-2", className)}>
      {showMark && <LogoMark size={markSize} />}
      <span className="font-serif text-2xl lowercase tracking-tight text-foreground">
        holicruit
      </span>
    </Link>
  );
}
