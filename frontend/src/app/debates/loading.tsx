import { DebateCardSkeleton } from '@/components/ui/skeleton'

export default function DebatesLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 space-y-4">
        <div className="h-8 w-48 animate-pulse rounded-md bg-secondary-200 dark:bg-secondary-800" />
        <div className="h-4 w-96 animate-pulse rounded-md bg-secondary-200 dark:bg-secondary-800" />
      </div>

      <div className="mb-8 flex flex-wrap gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="h-10 w-24 animate-pulse rounded-full bg-secondary-200 dark:bg-secondary-800"
          />
        ))}
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 9 }).map((_, i) => (
          <DebateCardSkeleton key={i} />
        ))}
      </div>
    </div>
  )
} 