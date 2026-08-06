export function PageHeader({ eyebrow, title, description, actions }: { eyebrow?: string; title: string; description?: string; actions?: React.ReactNode }) {
  return <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
    <div>{eyebrow && <p className="mb-1 text-xs font-bold tracking-[.08em] text-[var(--accent)] uppercase">{eyebrow}</p>}<h1 className="text-[26px] font-bold tracking-[-.035em] md:text-[30px]">{title}</h1>{description && <p className="muted mt-1 text-[14px]">{description}</p>}</div>
    {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
  </div>;
}
