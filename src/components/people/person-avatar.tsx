import Image from "next/image";
import type { Person } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * Avatar with an initials fallback. All imagery is placeholder in the handoff,
 * so most renders use the initials tile; `avatarUrl` is honored when present.
 */
export function PersonAvatar({
  person,
  size = 40,
  className,
}: {
  person: Pick<Person, "name" | "initials" | "avatarUrl">;
  size?: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-secondary font-semibold text-secondary-foreground",
        className,
      )}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.4) }}
      aria-label={person.name}
      title={person.name}
    >
      {person.avatarUrl ? (
        <Image src={person.avatarUrl} alt={person.name} fill className="object-cover" sizes={`${size}px`} />
      ) : (
        <span aria-hidden>{person.initials}</span>
      )}
    </div>
  );
}

/** Square logo placeholder for a company (initial letter). */
export function CompanyMark({
  name,
  size = 40,
  className,
}: {
  name: string;
  size?: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-lg bg-muted font-bold text-muted-foreground",
        className,
      )}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.42) }}
      aria-label={name}
      title={name}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );
}
