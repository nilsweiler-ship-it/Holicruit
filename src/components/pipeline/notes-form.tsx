"use client";

import { Button } from "@/components/ui/button";
import { addNote } from "@/lib/actions/hm";

/** Add a private pipeline note to a candidate. */
export function NotesForm({ matchId }: { matchId: string }) {
  return (
    <form
      action={addNote.bind(null, matchId)}
      className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5"
    >
      <textarea
        name="body"
        required
        rows={3}
        placeholder="Add a note about this candidate…"
        className="resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
      />
      <div>
        <Button type="submit">Add note</Button>
      </div>
    </form>
  );
}
