import { cn, initials } from "@/lib/utils";

export function UserAvatar({
  name,
  image,
  className,
}: {
  name: string;
  image?: string | null;
  className?: string;
}) {
  return (
    <span
      role="img"
      aria-label={`${name}'s profile photo`}
      className={cn(
        "grid size-10 shrink-0 place-items-center rounded-xl bg-[#292733] bg-cover bg-center text-xs font-bold text-white",
        className,
      )}
      style={image ? { backgroundImage: `url(${image})` } : undefined}
    >
      {!image && initials(name)}
    </span>
  );
}
