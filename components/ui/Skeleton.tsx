'use client';

export function SkeletonBox({ className = '' }: { className?: string }) {
  return <div className={`skeleton rounded-lg ${className}`} />;
}

export function SkeletonText({ lines = 3, className = '' }: { lines?: number; className?: string }) {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="skeleton rounded h-3" style={{ width: i === lines - 1 ? '60%' : '100%' }} />
      ))}
    </div>
  );
}

export function PlaceCardSkeleton() {
  return (
    <div className="bg-surface rounded-2xl p-4 flex gap-3.5 shadow-card border border-warm-50">
      <SkeletonBox className="w-[72px] h-[72px] rounded-xl shrink-0" />
      <div className="flex-1">
        <SkeletonBox className="w-3/4 h-4 mb-2" />
        <SkeletonBox className="w-1/2 h-3 mb-3" />
        <div className="flex gap-1.5">
          <SkeletonBox className="w-16 h-5 rounded-full" />
          <SkeletonBox className="w-14 h-5 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function DetailSkeleton() {
  return (
    <div className="animate-fade-in">
      <SkeletonBox className="w-full h-[220px] rounded-none" />
      <div className="p-4">
        <SkeletonBox className="w-2/3 h-6 mb-3" />
        <div className="flex gap-2 mb-6">
          <SkeletonBox className="w-20 h-7 rounded-full" />
          <SkeletonBox className="w-16 h-7 rounded-full" />
          <SkeletonBox className="w-18 h-7 rounded-full" />
        </div>
        <SkeletonBox className="w-full h-[140px] rounded-2xl mb-4" />
        <SkeletonText lines={4} />
      </div>
    </div>
  );
}
