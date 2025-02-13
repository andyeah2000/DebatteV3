export interface ErrorMessageProps {
  message: string
}

export function ErrorMessage({ message }: ErrorMessageProps) {
  return (
    <div className="rounded-lg bg-red-50 p-4 dark:bg-red-900/10">
      <p className="text-red-700 dark:text-red-400">{message}</p>
    </div>
  )
} 