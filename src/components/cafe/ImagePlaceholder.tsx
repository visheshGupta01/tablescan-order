import { Coffee } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Reusable image surface with a designed placeholder fallback.
 * Drop in an `imageUrl` later and the layout stays identical.
 */
export function ImagePlaceholder({
  imageUrl,
  alt,
  label = "Food image",
  aspectRatio = "4/3",
  className,
  imageClassName,
  rounded = "rounded-xl",
  eager,
  grayscale,
  overlay,
}: {
  imageUrl?: string | null;
  alt?: string;
  label?: string;
  aspectRatio?: string;
  className?: string;
  imageClassName?: string;
  rounded?: string;
  eager?: boolean;
  grayscale?: boolean;
  overlay?: boolean;
}) {
  return (
    <div
      className={cn("relative w-full overflow-hidden bg-elevated", rounded, className)}
      style={{ aspectRatio }}
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={alt ?? label}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          className={cn(
            "h-full w-full object-cover transition-transform duration-500 ease-dose",
            grayscale && "grayscale",
            imageClassName,
          )}
        />
      ) : (
        <div
          role="img"
          aria-label={`${label} placeholder`}
          className="flex h-full w-full flex-col items-center justify-center gap-2 border border-border bg-[repeating-linear-gradient(135deg,transparent_0_10px,rgba(255,255,255,0.02)_10px_20px)] text-center"
        >
          <Coffee className="size-5 text-subtle" aria-hidden />
          <span className="dose-label px-3 text-subtle">{label}</span>
        </div>
      )}
      {overlay ? (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background via-background/25 to-transparent"
        />
      ) : null}
    </div>
  );
}
