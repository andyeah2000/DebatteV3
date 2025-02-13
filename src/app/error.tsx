'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="min-h-[80vh] bg-white dark:bg-secondary-900">
      <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
        <motion.div
          className="mx-auto max-w-2xl text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <svg
              className="h-6 w-6 text-red-600 dark:text-red-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </motion.div>
          <motion.h1
            className="mt-6 text-3xl font-bold tracking-tight text-secondary-900 dark:text-white sm:text-5xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            Something went wrong
          </motion.h1>
          <motion.p
            className="mt-6 text-base leading-7 text-secondary-600 dark:text-secondary-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            We&apos;ve encountered an unexpected error. Our team has been notified and is working to fix
            the issue.
          </motion.p>
          {error.digest && (
            <motion.p
              className="mt-2 text-sm text-secondary-500 dark:text-secondary-400"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              Error ID: {error.digest}
            </motion.p>
          )}
          <motion.div
            className="mt-10 flex items-center justify-center gap-x-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <Button onClick={() => reset()} size="lg">
              Try again
            </Button>
            <Link href="/">
              <Button variant="outline" size="lg">Go back home</Button>
            </Link>
          </motion.div>
        </motion.div>

        <motion.div
          className="mx-auto mt-16 max-w-2xl rounded-lg bg-secondary-50 p-6 dark:bg-secondary-800"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          <h2 className="text-lg font-semibold text-secondary-900 dark:text-white">
            Need assistance?
          </h2>
          <p className="mt-2 text-sm text-secondary-600 dark:text-secondary-400">
            If this error persists, please contact our support team at{' '}
            <a
              href="mailto:support@debattle.com"
              className="text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
            >
              support@debattle.com
            </a>{' '}
            or visit our{' '}
            <Link
              href="/help"
              className="text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
            >
              Help Center
            </Link>
            .
          </p>
        </motion.div>
      </div>
    </div>
  )
} 