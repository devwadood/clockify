"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Bell,
  BriefcaseBusiness,
  CalendarRange,
  ChevronDown,
  CircleHelp,
  Command,
  Globe2,
  LayoutDashboard,
  LockKeyhole,
  Menu,
  PanelLeftClose,
  Play,
  Plus,
  Search,
  Settings,
  ScrollText,
  ShieldCheck,
  LogOut,
  Share2,
  TimerReset,
  Users,
  UserRound,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { initials } from "@/lib/utils";
import { LogoMark } from "@/components/brand/logo";
import { logout } from "@/server/actions/auth";

const nav = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Timer", href: "/timer", icon: TimerReset },
  { label: "Timesheets", href: "/timesheets/week", icon: CalendarRange },
  { label: "Projects", href: "/projects", icon: BriefcaseBusiness },
  { label: "Reports", href: "/reports", icon: BarChart3 },
  { label: "Team", href: "/team", icon: Users },
  { label: "Shared reports", href: "/shared-reports", icon: Share2 },
];

export function AppShell({
  children,
  user,
  theme,
}: {
  children: React.ReactNode;
  user: { name: string; email: string; image: string | null };
  theme: "system" | "light" | "dark";
}) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const sidebar = (
    <>
      <div className="flex h-16 items-center gap-3 px-4">
        <Link href="/dashboard" className="flex min-w-0 items-center gap-3">
          <LogoMark className="size-9 shrink-0 text-[var(--accent)]" />
          {!collapsed && (
            <span className="text-[18px] font-bold tracking-[-.03em]">
              Tracker
            </span>
          )}
        </Link>
        <button
          aria-label="Close navigation"
          onClick={() => setMobileOpen(false)}
          className="mobile-only ml-auto rounded-md p-2 hover:bg-[var(--surface-2)]"
        >
          <X size={19} />
        </button>
      </div>
      <div className="mx-3 mt-2 mb-5">
        <button
          className={cn(
            "flex h-11 w-full items-center rounded-[10px] border border-[var(--border)] bg-[var(--surface-2)] px-2.5 hover:border-[#d8d8de]",
            collapsed ? "justify-center" : "gap-2.5",
          )}
        >
          <span className="grid size-7 shrink-0 place-items-center rounded-md bg-[#1f2937] text-[10px] font-bold text-white">
            NS
          </span>
          {!collapsed && (
            <>
              <span className="min-w-0 flex-1 truncate text-left text-[13px] font-semibold">
                {user.name}&apos;s workspace
              </span>
              <ChevronDown size={14} className="muted" />
            </>
          )}
        </button>
      </div>
      <nav className="flex-1 space-y-1 px-3" aria-label="Main navigation">
        {!collapsed && (
          <p className="mb-2 px-2 text-[10px] font-bold tracking-[.1em] text-[var(--muted)] uppercase">
            Workspace
          </p>
        )}
        {nav.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/dashboard" &&
              pathname.startsWith(item.href.split("/week")[0]));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              title={collapsed ? item.label : undefined}
              className={cn(
                "flex h-10 items-center rounded-lg text-[13.5px] font-medium transition-colors",
                collapsed ? "justify-center" : "gap-3 px-2.5",
                active
                  ? "bg-[var(--accent-soft)] text-[var(--accent)]"
                  : "text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]",
              )}
            >
              <item.icon size={18} strokeWidth={active ? 2.3 : 1.9} />
              {!collapsed && item.label}
            </Link>
          );
        })}
      </nav>
      <div className="m-3 space-y-1 border-t border-[var(--border)] pt-3">
        <Link
          href="/settings/profile"
          className={cn(
            "flex h-10 items-center rounded-lg text-[13.5px] font-medium text-[var(--muted)] hover:bg-[var(--surface-2)]",
            collapsed ? "justify-center" : "gap-3 px-2.5",
          )}
        >
          <Settings size={18} />
          {!collapsed && "Settings"}
        </Link>
        <Link
          href="/terms"
          title={collapsed ? "Terms of service" : undefined}
          className={cn(
            "flex h-10 items-center rounded-lg text-[13.5px] font-medium text-[var(--muted)] hover:bg-[var(--surface-2)]",
            collapsed ? "justify-center" : "gap-3 px-2.5",
          )}
        >
          <ScrollText size={18} />
          {!collapsed && "Terms of service"}
        </Link>
        <Link
          href="/privacy"
          title={collapsed ? "Privacy policy" : undefined}
          className={cn(
            "flex h-10 items-center rounded-lg text-[13.5px] font-medium text-[var(--muted)] hover:bg-[var(--surface-2)]",
            collapsed ? "justify-center" : "gap-3 px-2.5",
          )}
        >
          <ShieldCheck size={18} />
          {!collapsed && "Privacy policy"}
        </Link>
        <button
          className={cn(
            "flex h-10 w-full items-center rounded-lg text-[13.5px] font-medium text-[var(--muted)] hover:bg-[var(--surface-2)]",
            collapsed ? "justify-center" : "gap-3 px-2.5",
          )}
        >
          <CircleHelp size={18} />
          {!collapsed && "Help & feedback"}
        </button>
        <form action={logout}>
          <button
            title={collapsed ? "Log out" : undefined}
            className={cn(
              "flex h-10 w-full items-center rounded-lg text-[13.5px] font-medium text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-red-600",
              collapsed ? "justify-center" : "gap-3 px-2.5",
            )}
          >
            <LogOut size={18} />
            {!collapsed && "Log out"}
          </button>
        </form>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "desktop-only flex h-10 w-full items-center rounded-lg text-[13.5px] font-medium text-[var(--muted)] hover:bg-[var(--surface-2)]",
            collapsed ? "justify-center" : "gap-3 px-2.5",
          )}
        >
          <PanelLeftClose size={18} className={collapsed ? "rotate-180" : ""} />
          {!collapsed && "Collapse"}
        </button>
      </div>
    </>
  );

  return (
    <div
      className="min-h-screen bg-[var(--background)] text-[var(--text)]"
      data-theme={theme === "system" ? undefined : theme}
    >
      <aside
        className={cn(
          "desktop-only fixed inset-y-0 left-0 z-30 flex flex-col overflow-y-auto border-r border-[var(--border)] bg-[var(--surface)] transition-[width] duration-200",
          collapsed ? "w-[72px]" : "w-[230px]",
        )}
      >
        {sidebar}
      </aside>
      {mobileOpen && (
        <>
          <div
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px] md:hidden"
          />
          <aside className="fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col overflow-y-auto bg-[var(--surface)] shadow-2xl md:hidden">
            {sidebar}
          </aside>
        </>
      )}
      <div
        className={cn(
          "transition-[padding] duration-200",
          collapsed ? "md:pl-[72px]" : "md:pl-[230px]",
        )}
      >
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-[var(--border)] bg-[color-mix(in_srgb,var(--background)_88%,transparent)] px-4 backdrop-blur-xl md:px-7">
          <button
            aria-label="Open navigation"
            onClick={() => setMobileOpen(true)}
            className="mobile-only rounded-lg p-2 hover:bg-[var(--surface)]"
          >
            <Menu size={20} />
          </button>
          <button className="desktop-only flex h-9 w-full max-w-[330px] items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 text-[13px] text-[var(--muted)] hover:border-[#d1d1d8]">
            <Search size={16} />
            <span className="flex-1 text-left">Search anything…</span>
            <kbd className="flex items-center gap-0.5 rounded border border-[var(--border)] px-1.5 py-0.5 text-[10px]">
              <Command size={10} />K
            </kbd>
          </button>
          <div className="ml-auto flex items-center gap-2">
            <Link
              href="/timer"
              className="btn btn-primary hidden sm:inline-flex"
            >
              <Play size={14} fill="currentColor" />
              Start timer
            </Link>
            <span className="group/notice relative">
              <button
                disabled
                aria-label="Notifications coming soon"
                className="btn icon-btn cursor-not-allowed opacity-45"
              >
                <Bell size={17} />
              </button>
              <span
                role="tooltip"
                className="pointer-events-none absolute top-full right-0 z-50 mt-2 w-max translate-y-1 rounded-lg bg-[#202027] px-2.5 py-1.5 text-[11px] font-semibold text-white opacity-0 shadow-lg transition group-hover/notice:translate-y-0 group-hover/notice:opacity-100"
              >
                Coming soon
              </span>
            </span>
            <div className="group/profile relative">
              <button
                aria-label={`Open profile menu for ${user.name}`}
                aria-haspopup="menu"
                className="flex items-center gap-2 rounded-lg p-1.5 hover:bg-[var(--surface)] focus:bg-[var(--surface)]"
              >
                <span
                  className="grid size-8 place-items-center rounded-lg bg-[#292733] bg-cover bg-center text-[11px] font-bold text-white"
                  style={
                    user.image
                      ? { backgroundImage: `url(${user.image})` }
                      : undefined
                  }
                >
                  {!user.image && initials(user.name)}
                </span>
                <ChevronDown size={14} className="desktop-only muted" />
              </button>
              <div className="invisible absolute top-full right-0 z-50 w-60 translate-y-1 pt-2 opacity-0 transition group-hover/profile:visible group-hover/profile:translate-y-0 group-hover/profile:opacity-100 group-focus-within/profile:visible group-focus-within/profile:translate-y-0 group-focus-within/profile:opacity-100">
                <div
                  role="menu"
                  className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] p-2 shadow-xl"
                >
                  <div className="border-b border-[var(--border)] px-3 py-2.5">
                    <b className="block truncate text-sm">{user.name}</b>
                    <span className="muted mt-0.5 block truncate text-xs">
                      {user.email}
                    </span>
                  </div>
                  <div className="py-1">
                    {[
                      [UserRound, "Profile", "/settings/profile"],
                      [Globe2, "Preferences", "/settings/preferences"],
                      [LockKeyhole, "Security", "/settings/security"],
                      [Bell, "Notifications", "/settings/notifications"],
                    ].map(([Icon, label, href]) => (
                      <Link
                        key={href as string}
                        href={href as string}
                        role="menuitem"
                        className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-[var(--surface-2)]"
                      >
                        <Icon size={16} className="muted" />
                        {label as string}
                      </Link>
                    ))}
                  </div>
                  <form
                    action={logout}
                    className="border-t border-[var(--border)] pt-1"
                  >
                    <button
                      role="menuitem"
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-500/[.07]"
                    >
                      <LogOut size={16} />
                      Log out
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </header>
        <main className="mx-auto min-h-[calc(100vh-64px)] max-w-[1500px] p-4 pb-24 md:p-7 md:pb-8">
          {children}
        </main>
      </div>
      <nav className="mobile-only fixed right-3 bottom-3 left-3 z-30 grid h-16 grid-cols-5 items-center rounded-2xl border border-[var(--border)] bg-[color-mix(in_srgb,var(--surface)_92%,transparent)] px-2 shadow-xl backdrop-blur-xl">
        {[nav[0], nav[2]].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex min-w-14 flex-col items-center gap-1 text-[10px] font-semibold",
              pathname.startsWith(item.href.split("/week")[0])
                ? "text-[var(--accent)]"
                : "muted",
            )}
          >
            <item.icon size={20} />
            {item.label}
          </Link>
        ))}
        <Link
          href="/timer"
          aria-label="Add entry"
          className="mx-auto -mt-8 grid size-13 place-items-center rounded-full bg-[var(--accent)] text-white shadow-lg shadow-[#6558d3]/25"
        >
          <Plus size={23} />
        </Link>
        {[nav[3], nav[4]].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex min-w-0 flex-col items-center gap-1 text-[10px] font-semibold",
              pathname.startsWith(item.href) ? "text-[var(--accent)]" : "muted",
            )}
          >
            <item.icon size={20} />
            <span className="max-w-full truncate">{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
