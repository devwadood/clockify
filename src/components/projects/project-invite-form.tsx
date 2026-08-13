"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { MailPlus } from "lucide-react";
import {
  inviteProjectMember,
  type ProjectInviteState,
} from "@/server/actions/invitations";

const initialState: ProjectInviteState = {};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button disabled={pending} className="btn btn-primary sm:self-end">
      <MailPlus size={15} />
      {pending ? "Sending…" : "Send invite"}
    </button>
  );
}

export function ProjectInviteForm({ projectId }: { projectId: string }) {
  const [state, action] = useActionState(inviteProjectMember, initialState);

  return (
    <form action={action} className="border-b border-[var(--border)] p-5">
      <input type="hidden" name="projectId" value={projectId} />
      <div>
        <h2 className="section-title">Invite a project member</h2>
        <p className="muted mt-1 text-xs">
          Send a secure invitation that expires in seven days.
        </p>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_150px_auto]">
        <div>
          <label className="label" htmlFor="project-invite-email">
            Email address
          </label>
          <input
            id="project-invite-email"
            name="email"
            required
            type="email"
            autoComplete="email"
            className="field"
            placeholder="teammate@company.com"
          />
        </div>
        <div>
          <label className="label" htmlFor="project-invite-role">
            Role
          </label>
          <select id="project-invite-role" name="role" className="field">
            <option value="member">Member</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <SubmitButton />
      </div>
      {state.error && (
        <p role="alert" className="mt-3 text-sm text-red-600">
          {state.error}
        </p>
      )}
      {state.success && (
        <p role="status" className="mt-3 text-sm text-emerald-600">
          {state.success}
        </p>
      )}
    </form>
  );
}
