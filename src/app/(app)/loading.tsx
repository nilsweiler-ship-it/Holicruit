/**
 * Light loading state for the signed-in app while a server component streams
 * (e.g. the pipeline's market snapshot). Rendered inside the app shell.
 */
export default function AppLoading() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading…</span>
      <div className="flex flex-col gap-2">
        <div className="h-8 w-2/3 max-w-sm animate-pulse rounded-lg bg-muted" />
        <div className="h-4 w-1/2 max-w-xs animate-pulse rounded-md bg-muted" />
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-28 animate-pulse rounded-2xl border border-border bg-card" />
        ))}
      </div>
      <div className="h-40 animate-pulse rounded-2xl border border-border bg-card" />
    </div>
  );
}
