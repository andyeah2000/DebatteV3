'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="min-h-[80vh] bg-white dark:bg-secondary-900">
      <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
        <motion.div
          className="mx-auto max-w-2xl text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.p
            className="text-base font-semibold text-primary-600 dark:text-primary-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            404
          </motion.p>
          <motion.h1
            className="mt-4 text-3xl font-bold tracking-tight text-secondary-900 dark:text-white sm:text-5xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            Page not found
          </motion.h1>
          <motion.p
            className="mt-6 text-base leading-7 text-secondary-600 dark:text-secondary-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            Sorry, we couldn&apos;t find the page you&apos;re looking for. Perhaps you&apos;ve mistyped the URL or
            the page has been moved.
          </motion.p>
          <motion.div
            className="mt-10 flex items-center justify-center gap-x-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <Link href="/">
              <Button>Go back home</Button>
            </Link>
            <Link href="/debates">
              <Button variant="outline">Browse debates</Button>
            </Link>
          </motion.div>
        </motion.div>

        <motion.div
          className="mt-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <h2 className="text-center text-lg font-semibold text-secondary-900 dark:text-white">
            Popular Destinations
          </h2>
          <ul className="mt-4 flex flex-wrap justify-center gap-4">
            {[
              { name: 'Featured Debates', href: '/#featured' },
              { name: 'Start a Debate', href: '/debates/new' },
              { name: 'About Us', href: '/about' },
              { name: 'Help Center', href: '/help' },
            ].map((link) => (
              <li key={link.name}>
                <Link
                  href={link.href}
                  className="text-sm text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
                >
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
    </div>
  )
} 