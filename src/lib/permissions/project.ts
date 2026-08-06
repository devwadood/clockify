export type ProjectRole = "owner" | "admin" | "member";
export type ProjectAction = "view" | "log-time" | "manage-entry" | "manage-members" | "manage-project" | "reports" | "delete" | "transfer";
const grants: Record<ProjectRole, ReadonlySet<ProjectAction>> = {
  owner: new Set(["view","log-time","manage-entry","manage-members","manage-project","reports","delete","transfer"]),
  admin: new Set(["view","log-time","manage-entry","manage-members","manage-project","reports"]),
  member: new Set(["view","log-time"]),
};
export function can(role: ProjectRole, action: ProjectAction) { return grants[role].has(action); }
export function assertCan(role: ProjectRole | null, action: ProjectAction) { if (!role || !can(role, action)) throw new Error("FORBIDDEN"); }
