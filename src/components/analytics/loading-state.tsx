import { motion } from 'framer-motion';

export function LoadingState() {
  return (
    <div className="space-y-8">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className="h-10 w-64 animate-pulse rounded-lg bg-secondary/50" />
        <div className="flex space-x-4">
          <div className="flex space-x-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-10 w-24 animate-pulse rounded-md bg-secondary/50"
              />
            ))}
          </div>
          <div className="h-10 w-32 animate-pulse rounded-md bg-secondary/50" />
        </div>
      </div>

      {/* Grid Skeleton */}
      <div className="grid gap-8 md:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <motion.div
            key={i}
            className="rounded-lg bg-white p-6 shadow-lg dark:bg-secondary-800"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.2 }}
          >
            <div className="mb-4 h-6 w-48 animate-pulse rounded bg-secondary/50" />
            <div className="h-80 animate-pulse rounded bg-secondary/30" />
          </motion.div>
        ))}
      </div>
    </div>
  );
} 