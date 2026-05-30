

export const Skeleton = ({ className }: { className?: string }) => {
  return (
    <div className={`animate-pulse bg-gray-200 dark:bg-gray-800 rounded-lg ${className}`}></div>
  );
};

export const ProductCardSkeleton = () => (
  <div className="flex flex-col bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden h-full">
    <Skeleton className="w-full aspect-[4/3] rounded-none" />
    <div className="p-5 flex flex-col flex-grow">
      <Skeleton className="h-6 w-3/4 mb-2" />
      <Skeleton className="h-4 w-full mb-1" />
      <Skeleton className="h-4 w-2/3 mb-4" />
      <div className="mt-auto flex items-center justify-between">
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-10 w-24 rounded-full" />
      </div>
    </div>
  </div>
);

export const TableRowSkeleton = ({ columns = 4 }: { columns?: number }) => (
  <div className="flex items-center gap-4 py-4 border-b border-gray-100 dark:border-gray-800">
    {Array.from({ length: columns }).map((_, i) => (
      <Skeleton key={i} className={`h-4 ${i === 0 ? 'w-1/4' : 'flex-1'}`} />
    ))}
  </div>
);

export const DashboardCardSkeleton = () => (
  <div className="rounded-2xl bg-white dark:bg-gray-900 p-6 shadow-sm border border-gray-100 dark:border-gray-800">
    <div className="flex items-center justify-between mb-4">
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-10 w-10 rounded-lg" />
    </div>
    <Skeleton className="h-8 w-1/2 mb-4" />
    <Skeleton className="h-4 w-2/3" />
  </div>
);
