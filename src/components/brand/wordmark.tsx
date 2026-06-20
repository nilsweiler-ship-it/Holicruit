import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * The Holicruit wordmark. Outfit, lowercase, with the dot on the "i" carrying
 * the coral brand accent (a nod to the logo mark).
 */
export function Wordmark({
  href = "/",
  className,
}: {
  href?: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-baseline text-lg font-extrabold lowercase tracking-tight text-foreground",
        className,
      )}
    >
      hol
      <span className="text-primary">i</span>
      cruit
    </Link>
  );
}
