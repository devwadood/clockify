"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  Camera,
  Check,
  Globe2,
  LockKeyhole,
  MoreHorizontal,
  Plus,
  Search,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/ui/page-header";
import { team } from "@/lib/demo-data";
import { cn } from "@/lib/utils";
export function TeamView() {
  return (
    <>
      <PageHeader
        title="Team"
        description="Manage workspace members, invitations, and access."
        actions={
          <button
            className="btn btn-primary"
            onClick={() => toast.info("Invitation dialog opened")}
          >
            <Plus size={15} />
            Invite member
          </button>
        }
      />
      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        <div className="card p-4">
          <p className="muted text-xs">Active members</p>
          <p className="mt-2 text-2xl font-bold">{team.length}</p>
        </div>
        <div className="card p-4">
          <p className="muted text-xs">Pending invitations</p>
          <p className="mt-2 text-2xl font-bold">2</p>
        </div>
        <div className="card p-4">
          <p className="muted text-xs">Hours this week</p>
          <p className="mt-2 text-2xl font-bold">131h 45m</p>
        </div>
      </div>
      <div className="card overflow-hidden">
        <div className="flex items-center gap-2 border-b border-[var(--border)] p-4">
          <Search size={16} className="muted" />
          <input
            className="min-w-0 flex-1 bg-transparent text-sm outline-none"
            placeholder="Search members…"
          />
          <button className="btn">All roles</button>
        </div>
        {team.map((m) => (
          <div
            key={m.email}
            className="flex items-center gap-3 border-b border-[var(--border)] p-4 last:border-0 md:px-5"
          >
            <span className="grid size-10 place-items-center rounded-xl bg-[var(--surface-2)] text-xs font-bold">
              {m.initials}
            </span>
            <div className="min-w-0 flex-1">
              <b className="block truncate text-sm">{m.name}</b>
              <span className="muted block truncate text-xs">{m.email}</span>
            </div>
            <span className="badge hidden sm:inline-flex">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              {m.status}
            </span>
            <div className="hidden w-28 text-right md:block">
              <b className="text-sm">{m.hours}</b>
              <p className="muted mt-1 text-[11px]">this week</p>
            </div>
            <select
              className="field w-28 text-xs"
              defaultValue={m.role}
              disabled={m.role === "Owner"}
            >
              <option>Owner</option>
              <option>Admin</option>
              <option>Member</option>
            </select>
            <button className="btn icon-btn">
              <MoreHorizontal size={16} />
            </button>
          </div>
        ))}
      </div>
    </>
  );
}
const settingsNav = [
  [UserRound, "Profile", "/settings/profile"],
  [Globe2, "Preferences", "/settings/preferences"],
  [LockKeyhole, "Security", "/settings/security"],
  [Bell, "Notifications", "/settings/notifications"],
] as const;
export function SettingsView({
  user,
}: {
  user: { name: string; email: string };
}) {
  const path = usePathname();
  const section = path.split("/").at(-1);
  return (
    <>
      <PageHeader
        title="Settings"
        description="Manage your profile, preferences, and account security."
      />
      <div className="grid gap-5 lg:grid-cols-[220px_1fr]">
        <aside className="card h-fit p-2">
          {settingsNav.map(([Icon, l, h]) => (
            <Link
              href={h}
              key={h}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium",
                path === h
                  ? "bg-[var(--accent-soft)] text-[var(--accent)]"
                  : "muted hover:bg-[var(--surface-2)]",
              )}
            >
              <Icon size={17} />
              {l}
            </Link>
          ))}
        </aside>
        <div>
          {section === "profile" ? (
            <Profile user={user} />
          ) : section === "preferences" ? (
            <Preferences />
          ) : section === "security" ? (
            <Security />
          ) : (
            <Notifications />
          )}
        </div>
      </div>
    </>
  );
}
function Save() {
  return (
    <button
      onClick={() => toast.success("Changes saved")}
      className="btn btn-primary"
    >
      <Check size={15} />
      Save changes
    </button>
  );
}
function Profile({ user }: { user: { name: string; email: string } }) {
  return (
    <div className="space-y-5">
      <section className="card p-5 md:p-6">
        <h2 className="section-title">Profile details</h2>
        <div className="mt-5 flex flex-col gap-6 sm:flex-row">
          <div className="relative h-fit">
            <span className="grid size-20 place-items-center rounded-2xl bg-[#292733] text-xl font-bold text-white">
              {user.name
                .split(" ")
                .map((x) => x[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </span>
            <button
              aria-label="Change photo"
              className="absolute -right-2 -bottom-2 grid size-8 place-items-center rounded-full border border-[var(--border)] bg-[var(--surface)] shadow"
            >
              <Camera size={14} />
            </button>
          </div>
          <div className="grid flex-1 gap-4">
            <div>
              <label className="label">Full name</label>
              <input className="field" defaultValue={user.name} />
            </div>
            <div>
              <label className="label">Email address</label>
              <input className="field" defaultValue={user.email} disabled />
            </div>
            <Save />
          </div>
        </div>
      </section>
      <section className="card border-red-200 p-5 md:p-6">
        <h2 className="section-title text-red-600">Deactivate account</h2>
        <p className="muted mt-2 max-w-xl text-xs leading-5">
          Your history remains intact, but you will lose access to active
          projects. Ownership must be transferred before deactivation.
        </p>
        <button className="btn mt-4 text-red-600">Deactivate account</button>
      </section>
    </div>
  );
}
function Preferences() {
  return (
    <section className="card p-5 md:p-6">
      <h2 className="section-title">Regional preferences</h2>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="label">Timezone</label>
          <select className="field">
            <option>Asia/Karachi (UTC+05:00)</option>
            <option>UTC</option>
            <option>America/New_York</option>
          </select>
        </div>
        <div>
          <label className="label">Date format</label>
          <select className="field">
            <option>Aug 6, 2026</option>
            <option>06/08/2026</option>
            <option>2026-08-06</option>
          </select>
        </div>
        <div>
          <label className="label">Week starts on</label>
          <select className="field">
            <option>Monday</option>
            <option>Sunday</option>
            <option>Saturday</option>
          </select>
        </div>
        <div>
          <label className="label">Theme</label>
          <select className="field">
            <option>System</option>
            <option>Light</option>
            <option>Dark</option>
          </select>
        </div>
      </div>
      <div className="mt-5">
        <Save />
      </div>
    </section>
  );
}
function Security() {
  return (
    <div className="space-y-5">
      <section className="card p-5 md:p-6">
        <div className="flex gap-3">
          <span className="grid size-10 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
            <ShieldCheck size={19} />
          </span>
          <div>
            <h2 className="section-title">Account security</h2>
            <p className="muted mt-1 text-xs">
              Your email is verified and your account is protected.
            </p>
          </div>
        </div>
        <div className="mt-6 grid gap-4">
          <div>
            <label className="label">Current password</label>
            <input type="password" className="field" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">New password</label>
              <input type="password" className="field" />
            </div>
            <div>
              <label className="label">Confirm password</label>
              <input type="password" className="field" />
            </div>
          </div>
          <Save />
        </div>
      </section>
      <section className="card p-5">
        <h2 className="section-title">Active sessions</h2>
        <div className="mt-4 flex items-center gap-3 rounded-xl border border-[var(--border)] p-4">
          <Globe2 size={19} className="muted" />
          <div className="flex-1">
            <b className="text-sm">Chrome on macOS</b>
            <p className="muted mt-1 text-xs">
              Karachi, Pakistan · Current session
            </p>
          </div>
          <span className="size-2 rounded-full bg-emerald-500" />
        </div>
      </section>
    </div>
  );
}
function Notifications() {
  const items = [
    "Project invitations and membership changes",
    "Timesheet submissions and approvals",
    "Report generation and sharing",
    "Product updates and tips",
  ];
  return (
    <section className="card p-5 md:p-6">
      <h2 className="section-title">Email notifications</h2>
      <p className="muted mt-1 text-xs">
        Choose what Tracker sends to your inbox.
      </p>
      <div className="mt-5 divide-y divide-[var(--border)]">
        {items.map((x, i) => (
          <label key={x} className="flex items-center gap-3 py-4 text-sm">
            <span className="flex-1">{x}</span>
            <input
              type="checkbox"
              defaultChecked={i < 3}
              className="size-4 accent-[var(--accent)]"
            />
          </label>
        ))}
      </div>
      <div className="mt-4">
        <Save />
      </div>
    </section>
  );
}
export function NotificationsPage() {
  const notes = [
    {
      title: "Maya submitted a timesheet",
      body: "31h 05m for Aug 3–9 is ready for review.",
      time: "12 min ago",
    },
    {
      title: "Report is ready",
      body: "August utilization was generated successfully.",
      time: "2h ago",
    },
    {
      title: "Nadia joined Atlas redesign",
      body: "Your invitation was accepted.",
      time: "Yesterday",
    },
  ];
  return (
    <>
      <PageHeader
        title="Notifications"
        description="Updates that need your attention."
        actions={<button className="btn">Mark all as read</button>}
      />
      <div className="card overflow-hidden">
        {notes.map((n, i) => (
          <div
            key={n.title}
            className="flex gap-3 border-b border-[var(--border)] p-4 last:border-0"
          >
            <span
              className={cn(
                "mt-1 size-2 rounded-full",
                i === 2 ? "bg-transparent" : "bg-[var(--accent)]",
              )}
            />
            <div className="flex-1">
              <b className="text-sm">{n.title}</b>
              <p className="muted mt-1 text-xs">{n.body}</p>
            </div>
            <span className="muted text-xs">{n.time}</span>
          </div>
        ))}
      </div>
    </>
  );
}
