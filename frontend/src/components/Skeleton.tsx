import React from "react"


export const SkeletonBlock: React.FC<{ className?: string }> = ({ className = "" }) => {
  return <div className={`animate-pulse bg-slate-200 rounded-md ${className}`} />
}


export const StatsSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-white border border-slate-200 p-4 sm:p-6 rounded-md shadow-xs flex items-center justify-between">
          <div className="space-y-2 flex-1 mr-4">
            <SkeletonBlock className="h-3 w-16" />
            <SkeletonBlock className="h-6 w-24" />
          </div>
          <SkeletonBlock className="h-10 w-10 sm:h-11 sm:w-11 rounded-sm shrink-0" />
        </div>
      ))}
    </div>
  )
}


export const ListSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-md shadow-xs divide-y divide-slate-100">
      <div className="p-4 sm:p-5 bg-slate-50/60 border-b border-slate-200 flex items-center justify-between">
        <SkeletonBlock className="h-4 w-32" />
        <SkeletonBlock className="h-4 w-12" />
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="p-4 sm:p-5 flex items-center justify-between gap-4">
          <div className="space-y-2 flex-1">
            <SkeletonBlock className="h-4 w-1/3" />
            <SkeletonBlock className="h-3 w-1/4" />
          </div>
          <SkeletonBlock className="h-6 w-16" />
        </div>
      ))}
    </div>
  )
}


export const POSFormSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-12 space-y-2">
        <SkeletonBlock className="h-8 w-24" />
        <SkeletonBlock className="h-4 w-64" />
      </div>
      <div className="lg:col-span-7 space-y-6">
        {}
        <div className="bg-white border border-slate-200 p-4 sm:p-5 rounded-md space-y-4">
          <SkeletonBlock className="h-4 w-36" />
          <div className="space-y-3">
            <SkeletonBlock className="h-10 w-full" />
            <div className="flex gap-3">
              <SkeletonBlock className="h-10 flex-1" />
              <SkeletonBlock className="h-10 w-28" />
            </div>
          </div>
        </div>
        {}
        <div className="bg-white border border-slate-200 rounded-md divide-y divide-slate-100">
          <div className="p-4 flex items-center justify-between">
            <SkeletonBlock className="h-4 w-20" />
            <SkeletonBlock className="h-4 w-8" />
          </div>
          <div className="p-10 flex flex-col items-center gap-3">
            <SkeletonBlock className="h-12 w-12 rounded-full" />
            <SkeletonBlock className="h-4 w-40" />
          </div>
        </div>
      </div>
      <div className="lg:col-span-5">
        <ListSkeleton rows={3} />
      </div>
    </div>
  )
}
