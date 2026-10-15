import { cn } from "@/lib/utils";

export function CafeLogo({
  imageUrl,
  name,
  className,
}: {
  imageUrl?: string | null;
  name: string;
  className?: string;
}) {
  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={`${name} logo`}
        className={cn("size-12 shrink-0 rounded-full border border-border object-cover", className)}
      />
    );
  }
  return (
    <span
      aria-hidden
      className={cn(
        "grid size-12 shrink-0 place-items-center rounded-full border border-primary/40 bg-elevated font-display text-lg text-primary",
        className,
      )}
    >
      CD
    </span>
  );
}

export function TableIndicator({ tableName }: { tableName: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-primary">
      <span className="size-1.5 rounded-full bg-primary" aria-hidden />
      <span className="dose-label">{tableName}</span>
    </span>
  );
}

export function SectionHeading({
  label,
  title,
  className,
}: {
  label: string;
  title?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <span className="dose-label text-primary">{label}</span>
      {title ? <p className="text-sm text-muted-foreground">{title}</p> : null}
    </div>
  );
}
