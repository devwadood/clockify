import { cn } from "@/lib/utils";

export function LogoMark({className}:{className?:string}) {
  return <svg aria-hidden="true" viewBox="0 0 40 40" className={cn("size-9",className)} fill="none">
    <rect width="40" height="40" rx="12" fill="currentColor"/>
    <path d="M10.5 13.25h13.25M15.25 9.5v16.25c0 3.15 1.75 4.75 4.75 4.75 1.45 0 2.7-.35 3.75-1.05" stroke="white" strokeWidth="3.25" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M21.25 18.25h8.25M25 14.5v9.75c0 2.4 1.25 3.6 3.75 3.6.55 0 1.05-.06 1.5-.2" stroke="white" strokeWidth="3.25" strokeLinecap="round" strokeLinejoin="round" opacity=".72"/>
  </svg>;
}

export function BrandLogo({compact=false,className}:{compact?:boolean;className?:string}) {
  return <span className={cn("inline-flex items-center gap-2.5",className)}><LogoMark className="text-[var(--accent)]"/>{!compact&&<span className="text-[19px] font-bold tracking-[-.045em]">Tracker</span>}</span>;
}
