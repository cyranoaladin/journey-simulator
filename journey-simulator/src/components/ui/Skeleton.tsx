import { clsx } from 'clsx';

export function Skeleton({ className }: { className?: string }) {
  return <div className={clsx('shimmer rounded-lg bg-white/5', className)} />;
}

export function CardSkeleton() {
  return (
    <div className="p-5 rounded-2xl border border-white/7 space-y-3">
      <Skeleton className="h-8 w-8 rounded-xl" />
      <Skeleton className="h-6 w-16" />
      <Skeleton className="h-3 w-28" />
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="max-w-[1400px] mx-auto px-6 py-6 space-y-6">
      <Skeleton className="h-10 w-56" />
      <div className="grid grid-cols-4 gap-4">
        {[0,1,2,3].map(i => <CardSkeleton key={i} />)}
      </div>
      <div className="grid grid-cols-[1fr_300px] gap-4">
        <Skeleton className="h-48 rounded-2xl" />
        <Skeleton className="h-48 rounded-2xl" />
      </div>
      <div className="grid grid-cols-3 gap-4">
        {[0,1,2].map(i => <Skeleton key={i} className="h-56 rounded-2xl" />)}
      </div>
    </div>
  );
}
