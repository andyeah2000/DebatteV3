export function LoadingSpinner() {
  return (
    <div className="flex min-h-[200px] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-secondary-200 border-t-primary-600 dark:border-secondary-700 dark:border-t-primary-400" />
    </div>
  )
} 