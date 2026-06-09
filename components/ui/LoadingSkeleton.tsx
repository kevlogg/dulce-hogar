import { cn } from "@/lib/utils/cn";

export function LoadingSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-wood-200/60", className)}
      aria-hidden
    />
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="rounded-lg border border-border overflow-hidden bg-wood-50">
      <LoadingSkeleton className="aspect-[4/3] w-full" />
      <div className="p-4 space-y-2">
        <LoadingSkeleton className="h-5 w-3/4" />
        <LoadingSkeleton className="h-4 w-1/2" />
        <div className="flex gap-2 pt-2">
          <LoadingSkeleton className="h-9 flex-1" />
          <LoadingSkeleton className="h-9 w-20" />
        </div>
      </div>
    </div>
  );
}
