import { Skeleton } from "@/components/ui/skeleton";

export function MenuSkeleton() {
  return (
    <div className="mx-auto max-w-3xl px-4">
      <Skeleton className="h-44 w-full rounded-none" />
      <div className="mt-4 space-y-3">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      <div className="mt-8 space-y-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex gap-4">
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-1/2" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-1/4" />
            </div>
            <Skeleton className="size-24 rounded-md" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function CustomerMessage({
  title,
  message,
  children,
}: {
  title: string;
  message: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="max-w-sm text-center">
        <h1 className="text-2xl">{title}</h1>
        <p className="mt-3 text-sm text-muted-foreground">{message}</p>
        {children ? <div className="mt-6">{children}</div> : null}
      </div>
    </div>
  );
}
