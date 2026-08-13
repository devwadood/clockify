"use client";

import { Trash2 } from "lucide-react";
import { deleteTimeEntry } from "@/server/actions/time-entries";

export function DeleteTimeEntryButton() {
  return (
    <button
      type="submit"
      formAction={deleteTimeEntry}
      onClick={(event) => {
        if (!window.confirm("Delete this time entry? This cannot be undone.")) {
          event.preventDefault();
        }
      }}
      className="btn self-end text-red-600"
    >
      <Trash2 size={14} />
      Delete entry
    </button>
  );
}
