'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useSession, signOut } from 'next-auth/react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import type { Route } from 'next'
import { cn } from '@/lib/utils'

const navigation = [
  { name: 'Home', href: '/' as Route },
  { name: 'Debates', href: '/debates' as Route },
  { name: 'About', href: '/about' as Route },
]

const menuVariants = {
  closed: {
    opacity: 0,
    height: 0,
    transition: {
      duration: 0.2,
      ease: 'easeInOut'
    }
  },
  open: {
    opacity: 1,
    height: 'auto',
    transition: {
      duration: 0.2,
      ease: 'easeInOut'
    }
  }
}

export function Header() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8" aria-label="Global">
        <div className="flex h-16 items-center justify-between">
          <div className="flex lg:flex-1">
            <Link
              href={'/' as Route}
              className="-m-1.5 p-1.5 text-2xl font-bold tracking-tight hover:text-primary transition-colors"
            >
              Debattle
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="flex lg:hidden">
            <button
              type="button"
              className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <span className="sr-only">
                {isMobileMenuOpen ? 'Close menu' : 'Open menu'}
              </span>
              {isMobileMenuOpen ? (
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                  />
                </svg>
              )}
            </button>
          </div>

          {/* Desktop navigation */}
          <div className="hidden lg:flex lg:gap-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'text-sm font-medium transition-colors hover:text-foreground/80',
                  pathname === item.href
                    ? 'text-foreground'
                    : 'text-foreground/60'
                )}
              >
                {item.name}
              </Link>
            ))}
          </div>

          <div className="hidden lg:flex lg:flex-1 lg:justify-end lg:gap-x-6">
            {session ? (
              <div className="flex items-center space-x-4">
                <Link
                  href={'/debates/new' as Route}
                  className="text-sm font-medium text-primary hover:text-primary/90 transition-colors"
                >
                  Start Debate
                </Link>
                <Link
                  href={'/settings' as Route}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Settings
                </Link>
                <Link href={`/users/${session.user.id}` as Route}>
                  <div className="relative h-8 w-8 overflow-hidden rounded-full ring-2 ring-background">
                    <Image
                      className="object-cover"
                      src={session.user.image || `https://ui-avatars.com/api/?name=${session.user.name}`}
                      alt={session.user.name}
                      fill
                      sizes="32px"
                      priority
                    />
                  </div>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => signOut()}
                >
                  Sign out
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link href={'/login' as Route}>
                  <Button variant="ghost" size="sm">Sign in</Button>
                </Link>
                <Link href={'/register' as Route}>
                  <Button size="sm">Sign up</Button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              className="lg:hidden"
              initial="closed"
              animate="open"
              exit="closed"
              variants={menuVariants}
            >
              <div className="space-y-1 pb-3 pt-2">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'block rounded-lg px-3 py-2 text-base font-medium transition-colors',
                      pathname === item.href
                        ? 'bg-secondary text-foreground'
                        : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                    )}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
              <div className="border-t pb-3 pt-4">
                {session ? (
                  <div className="space-y-1 px-2">
                    <Link
                      href={'/debates/new' as Route}
                      className="block rounded-lg px-3 py-2 text-base font-medium text-primary hover:bg-secondary hover:text-primary/90 transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Start Debate
                    </Link>
                    <Link
                      href={'/settings' as Route}
                      className="block rounded-lg px-3 py-2 text-base font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Settings
                    </Link>
                    <Link
                      href={`/users/${session.user.id}` as Route}
                      className="block rounded-lg px-3 py-2 text-base font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Profile
                    </Link>
                    <button
                      className="block w-full rounded-lg px-3 py-2 text-left text-base font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                      onClick={() => {
                        setIsMobileMenuOpen(false)
                        signOut()
                      }}
                    >
                      Sign out
                    </button>
                  </div>
                ) : (
                  <div className="space-y-1 px-2">
                    <Link
                      href={'/login' as Route}
                      className="block rounded-lg px-3 py-2 text-base font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Sign in
                    </Link>
                    <Link
                      href={'/register' as Route}
                      className="block rounded-lg px-3 py-2 text-base font-medium text-foreground hover:bg-secondary transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Sign up
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  )
} 