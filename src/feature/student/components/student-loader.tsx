import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export const StudentLoader = () => {
  return (
    <div className="grid grid-cols-[1fr_auto] gap-4 h-full">
      <div className="min-h-0 space-y-4">
        {/* Header loader */}
        <div className="flex justify-between items-center">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-9 w-40" />
        </div>

        {/* Table loader */}
        <div className="border rounded-lg">
          {/* Table header */}
          <div className="border-b bg-muted/50 p-4">
            <div className="grid grid-cols-6 gap-4">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-20" />
            </div>
          </div>

          {/* Table rows */}
          <div className="divide-y">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="p-4">
                <div className="grid grid-cols-6 gap-4 items-center">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-20" />
                  <div className="flex justify-center">
                    <Skeleton className="h-8 w-8 rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats cards loader */}
      <div className="grid grid-rows-2 w-fit gap-4 items-center">
        <Card className="w-full h-full">
          <CardHeader>
            <CardTitle>
              <Skeleton className="h-5 w-32" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-16" />
          </CardContent>
        </Card>
        <Card className="w-fit h-full">
          <CardHeader>
            <CardTitle>
              <Skeleton className="h-5 w-40" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-6 w-20 rounded" />
              <Skeleton className="h-6 w-24 rounded" />
              <Skeleton className="h-6 w-18 rounded" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
