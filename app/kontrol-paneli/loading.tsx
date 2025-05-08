export default function Loading() {
  return (
    <div className="animate-pulse">
      {/* Header Skeleton */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <div className="h-8 w-48 bg-gray-200 rounded-lg mb-2"></div>
          <div className="h-6 w-32 bg-gray-200 rounded-lg"></div>
        </div>
        <div className="h-10 w-32 bg-gray-200 rounded-lg"></div>
      </div>

      {/* Stats Grid Skeleton */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="h-4 w-24 bg-gray-200 rounded mb-2"></div>
              <div className="h-8 w-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Side Distribution Skeleton */}
      <div className="bg-white shadow rounded-lg mb-8">
        <div className="px-4 py-5 sm:p-6">
          <div className="h-6 w-48 bg-gray-200 rounded mb-4"></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="h-4 w-24 bg-gray-200 rounded mb-2"></div>
              <div className="h-6 w-32 bg-gray-200 rounded mb-1"></div>
              <div className="h-4 w-16 bg-gray-200 rounded"></div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="h-4 w-24 bg-gray-200 rounded mb-2"></div>
              <div className="h-6 w-32 bg-gray-200 rounded mb-1"></div>
              <div className="h-4 w-16 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Assets and Asset Types Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Assets Skeleton */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="h-6 w-32 bg-gray-200 rounded"></div>
              <div className="h-4 w-24 bg-gray-200 rounded"></div>
            </div>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="h-4 w-24 bg-gray-200 rounded"></div>
                  <div className="h-4 w-20 bg-gray-200 rounded"></div>
                  <div className="h-4 w-32 bg-gray-200 rounded"></div>
                  <div className="h-4 w-24 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Asset Types Skeleton */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="h-6 w-32 bg-gray-200 rounded mb-4"></div>
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="h-4 w-32 bg-gray-200 rounded"></div>
                  <div className="h-4 w-24 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Add New Record Button Skeleton */}
      <div className="mt-8">
        <div className="h-10 w-40 bg-gray-200 rounded-lg"></div>
      </div>
    </div>
  );
} 