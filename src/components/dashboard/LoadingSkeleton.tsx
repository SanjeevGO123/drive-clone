import React from 'react';
import { Skeleton } from '../ui/skeleton';
import { Card, CardContent } from '../ui/card';

// LoadingSkeleton component displays loading skeletons for files and folders
// Props:
// - view: 'grid' or 'list' - determines the layout style
// - count: number of skeleton items to show

type LoadingSkeletonProps = {
  view: 'grid' | 'list';
  count?: number;
};

const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ view, count = 12 }) => {
  if (view === 'grid') {
    return (
      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 sm:gap-8 md:gap-10">
        {Array.from({ length: count }).map((_, index) => (
          <Card key={index} className="min-h-[200px] sm:min-h-[240px] md:min-h-[280px] lg:min-h-[320px] h-full">
            <CardContent className="p-6 flex flex-col items-center justify-center h-full space-y-6">
              <Skeleton className="h-20 w-20 rounded-lg" />
              <div className="space-y-3 w-full">
                <Skeleton className="h-5 w-3/4 mx-auto" />
                <Skeleton className="h-4 w-1/2 mx-auto" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      {/* Header row */}
      <div className="grid grid-cols-12 px-6 py-3 font-semibold text-gray-500 dark:text-gray-300 bg-gray-50 dark:bg-gray-900">
        <div className="col-span-6">Name</div>
        <div className="col-span-3">Type</div>
        <div className="col-span-3">Actions</div>
      </div>
      
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="grid grid-cols-12 items-center px-6 py-4">
          <div className="col-span-6 flex items-center gap-3">
            <Skeleton className="h-8 w-8 rounded" />
            <Skeleton className="h-4 w-32" />
          </div>
          <div className="col-span-3">
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
          <div className="col-span-3">
            <Skeleton className="h-8 w-8 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default LoadingSkeleton;
