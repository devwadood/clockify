"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  Mail,
  UserRound,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { BrandLogo } from "@/components/brand/logo";
type Mode = "login" | "register" | "forgot" | "reset";
export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const params = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);
  const title = {
    login: "Welcome back",
    register: "Create your account",
    forgot: "Reset your password",
    reset: "Choose a new password",
  }[mode];
  const subtitle = {
    login: "Sign in to keep your work moving.",
    register: "Start tracking clearly in a few minutes.",
    forgot: "We’ll send a secure reset link to your inbox.",
    reset: "Use at least 10 characters for a strong password.",
  }[mode];
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const data = Object.fromEntries(new FormData(e.currentTarget));
    try {
      const callbackURL = params.get("next") ?? "/dashboard";
      let endpoint = "/api/auth/sign-in/email";
      let body: Record<string, unknown> = {
        email: data.email,
        password: data.password,
        callbackURL,
      };
      if (mode === "register") {
        endpoint = "/api/auth/sign-up/email";
        body = {
          name: data.name,
          email: data.email,
          password: data.password,
          callbackURL,
        };
      }
      if (mode === "forgot") {
        endpoint = "/api/auth/request-password-reset";
        body = { email: data.email, redirectTo: "/reset-password" };
      }
      if (mode === "reset") {
        endpoint = "/api/auth/reset-password";
        body = { newPassword: data.password, token: params.get("token") };
      }
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.status === 503 && process.env.NODE_ENV === "development") {
        toast.info("Local mode: database is not connected");
        router.push("/dashboard");
        return;
      }
      if (!res.ok) {
        const result = (await res.json().catch(() => null)) as {
          message?: string;
        } | null;
        throw new Error(result?.message ?? "We couldn’t complete that request");
      }
      if (mode === "forgot") {
        router.push("/verify-email?sent=reset");
      } else if (mode === "reset") {
        toast.success("Password updated");
        router.push("/login");
      } else if (mode === "register") {
        router.push("/verify-email");
      } else router.push(callbackURL as never);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }
  return (
    <div className="w-full max-w-[420px]">
      <div className="mb-8">
        <Link href="/" className="mb-8 inline-flex"><BrandLogo /></Link>
        <h1 className="text-[30px] font-bold tracking-[-.04em]">{title}</h1>
        <p className="muted mt-2 text-sm">{subtitle}</p>
      </div>
      <form onSubmit={submit} className="grid gap-4">
        {mode === "register" && (
          <div>
            <label className="label">Full name</label>
            <div className="relative">
              <UserRound
                className="muted pointer-events-none absolute top-3 left-3"
                size={17}
              />
              <input
                name="name"
                required
                minLength={2}
                maxLength={80}
                className="field field-leading"
                placeholder="Your full name"
                autoComplete="name"
              />
            </div>
          </div>
        )}
        <div>
          <label className="label">Email address</label>
          <div className="relative">
            <Mail
              className="muted pointer-events-none absolute top-3 left-3"
              size={17}
            />
            <input
              name="email"
              required
              type="email"
              className="field field-leading"
              placeholder="you@company.com"
              autoComplete="email"
            />
          </div>
        </div>
        {mode !== "forgot" && (
          <div>
            <div className="flex items-center justify-between">
              <label className="label">
                {mode === "reset" ? "New password" : "Password"}
              </label>
              {mode === "login" && (
                <Link
                  href="/forgot-password"
                  className="mb-[7px] text-xs font-semibold text-[var(--accent)]"
                >
                  Forgot password?
                </Link>
              )}
            </div>
            <div className="relative">
              <LockKeyhole
                className="muted pointer-events-none absolute top-3 left-3"
                size={17}
              />
              <input
                name="password"
                required
                minLength={10}
                type={show ? "text" : "password"}
                className="field field-leading field-trailing"
                placeholder="At least 10 characters"
                autoComplete={
                  mode === "login" ? "current-password" : "new-password"
                }
              />
              <button
                type="button"
                onClick={() => setShow(!show)}
                className="muted absolute top-2.5 right-3 p-1"
                aria-label={show ? "Hide password" : "Show password"}
              >
                {show ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
        )}
        {mode === "register" && (
          <label className="flex items-start gap-2.5 text-xs leading-5">
            <input
              required
              type="checkbox"
              className="mt-0.5 size-4 accent-[var(--accent)]"
            />
            <span className="muted">
              I agree to the{" "}
              <Link className="text-[var(--text)] underline" href="#">
                Terms
              </Link>{" "}
              and{" "}
              <Link className="text-[var(--text)] underline" href="#">
                Privacy Policy
              </Link>
              .
            </span>
          </label>
        )}
        <button disabled={loading} className="btn btn-primary mt-1 h-11">
          {loading ? (
            <LoaderCircle size={17} className="animate-spin" />
          ) : (
            <>
              {mode === "login"
                ? "Sign in"
                : mode === "register"
                  ? "Create account"
                  : mode === "forgot"
                    ? "Send reset link"
                    : "Update password"}
              <ArrowRight size={15} />
            </>
          )}
        </button>
      </form>
      {(mode === "login" || mode === "register") && (
        <p className="muted mt-7 text-center text-sm">
          {mode === "login" ? "New to Tracker? " : "Already have an account? "}
          <Link
            href={
              mode === "login"
                ? `/register${params.get("next") ? `?next=${encodeURIComponent(params.get("next")!)}` : ""}`
                : `/login${params.get("next") ? `?next=${encodeURIComponent(params.get("next")!)}` : ""}`
            }
            className="font-semibold text-[var(--accent)]"
          >
            {mode === "login" ? "Create an account" : "Sign in"}
          </Link>
        </p>
      )}
      {mode === "forgot" && (
        <Link
          href="/login"
          className="muted mt-7 block text-center text-sm hover:text-[var(--text)]"
        >
          Back to sign in
        </Link>
      )}
    </div>
  );
}
export function AuthAside() {
  return (
    <aside className="hidden min-h-screen overflow-hidden bg-[#18171f] p-12 text-white lg:flex lg:flex-col">
      <Link href="/"><BrandLogo /></Link>
      <div className="my-auto max-w-lg">
        <p className="text-[34px] leading-[1.18] font-semibold tracking-[-.04em]">
          “Tracker finally gives us an honest picture of where the week
          went—without turning time tracking into a chore.”
        </p>
        <div className="mt-8 flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-full bg-[#6558d3] text-xs font-bold">
            MC
          </span>
          <div>
            <b className="text-sm">Maya Chen</b>
            <p className="mt-1 text-xs text-white/55">
              Head of Product, Northstar
            </p>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {[
          ["31h", "logged this week"],
          ["83%", "billable time"],
          ["4.9/5", "team rating"],
        ].map((x) => (
          <div
            key={x[0]}
            className="rounded-xl border border-white/10 bg-white/5 p-4"
          >
            <b className="text-xl">{x[0]}</b>
            <p className="mt-1 text-[10px] text-white/50">{x[1]}</p>
          </div>
        ))}
      </div>
    </aside>
  );
}
export function VerifyNotice() {
  const params = useSearchParams();
  return (
    <div className="w-full max-w-[420px] text-center">
      <Link href="/" className="mb-10 inline-flex"><BrandLogo /></Link>
      <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent)]">
        <CheckCircle2 size={25} />
      </span>
      <h1 className="mt-6 text-[28px] font-bold tracking-[-.03em]">
        Check your inbox
      </h1>
      <p className="muted mx-auto mt-3 max-w-sm text-sm leading-6">
        {params.get("sent") === "reset"
          ? "We sent you a secure password reset link."
          : "We sent a verification link to your email. Click it to activate your Tracker account."}
      </p>
      <Link href="/login" className="btn btn-primary mt-7">
        Back to sign in
      </Link>
    </div>
  );
}
