import { cn } from "@/lib/utils";

const watermarkSvg = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80' fill='none'%3E%3Cpath d='M34 58a20 20 0 0 1 0-36' stroke='%23161514' stroke-width='5' stroke-linecap='round' opacity='0.06'/%3E%3Cpath d='M46 22a20 20 0 0 1 0 36' stroke='%23161514' stroke-width='5' stroke-linecap='round' opacity='0.06'/%3E%3C/svg%3E")`;

export function Watermark({ className }: { className?: string }) {
  return (
    <div
      className={cn("absolute inset-0 pointer-events-none", className)}
      style={{
        backgroundImage: watermarkSvg,
        backgroundRepeat: "repeat",
        backgroundSize: "120px 120px",
      }}
      aria-hidden="true"
    />
  );
}
