import { cn } from "@/lib/utils/cn";

interface EmptyStateProps {
  title: string;
  description?: string;
  className?: string;
  children?: React.ReactNode;
}

export function EmptyState({ title, description, className, children }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-wood-50 py-12 px-6 text-center",
        className
      )}
    >
      <p className="font-medium text-foreground">{title}</p>
      {description && <p className="mt-1 text-sm text-muted">{description}</p>}
      {children && <div className="mt-6">{children}</div>}
    </div>
  );
}
