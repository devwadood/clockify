import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { BrandLogo } from "@/components/brand/logo";

export type LegalSection = {
  title: string;
  paragraphs?: string[];
  items?: string[];
};

export function LegalPage({
  title,
  description,
  sections,
}: {
  title: string;
  description: string;
  sections: LegalSection[];
}) {
  return (
    <main className="min-h-screen bg-[var(--background)]">
      <header className="border-b border-[var(--border)] bg-[var(--surface)]">
        <nav className="mx-auto flex h-16 max-w-5xl items-center px-5">
          <Link href="/" aria-label="Tracker home">
            <BrandLogo />
          </Link>
          <div className="muted ml-auto flex gap-5 text-xs font-semibold">
            <Link href="/terms" className="hover:text-[var(--text)]">
              Terms
            </Link>
            <Link href="/privacy" className="hover:text-[var(--text)]">
              Privacy
            </Link>
          </div>
        </nav>
      </header>
      <article className="mx-auto max-w-3xl px-5 py-12 sm:py-16">
        <Link
          href="/"
          className="muted inline-flex items-center gap-1.5 text-xs font-semibold hover:text-[var(--text)]"
        >
          <ArrowLeft size={14} />
          Back to Tracker
        </Link>
        <p className="mt-10 text-xs font-bold tracking-[.12em] text-[var(--accent)] uppercase">
          Legal
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-[-.045em] sm:text-5xl">
          {title}
        </h1>
        <p className="muted mt-5 max-w-2xl text-sm leading-7">{description}</p>
        <p className="muted mt-3 text-xs">Last updated: August 13, 2026</p>
        <div className="mt-12 space-y-10">
          {sections.map((section, index) => (
            <section key={section.title}>
              <h2 className="text-xl font-bold tracking-[-.025em]">
                {index + 1}. {section.title}
              </h2>
              {section.paragraphs?.map((paragraph) => (
                <p key={paragraph} className="muted mt-4 text-sm leading-7">
                  {paragraph}
                </p>
              ))}
              {section.items && (
                <ul className="muted mt-4 list-disc space-y-2 pl-5 text-sm leading-7">
                  {section.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>
        <div className="card mt-12 p-5 text-sm">
          <b>Questions about this document?</b>
          <p className="muted mt-2">
            Contact us at{" "}
            <a
              className="font-semibold text-[var(--accent)]"
              href="mailto:legal@tracker.abdulwadood.com"
            >
              legal@tracker.abdulwadood.com
            </a>
            .
          </p>
        </div>
      </article>
      <footer className="border-t border-[var(--border)] bg-[var(--surface)]">
        <div className="muted mx-auto flex max-w-5xl flex-col gap-2 px-5 py-6 text-xs sm:flex-row">
          <span>© 2026 Tracker. All rights reserved.</span>
          <span className="sm:ml-auto">tracker.abdulwadood.com</span>
        </div>
      </footer>
    </main>
  );
}
