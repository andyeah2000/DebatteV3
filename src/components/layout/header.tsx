'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { useSession, signOut } from 'next-auth/react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import type { Route } from 'next'

const navigation = [
  { name: 'Home', href: '/' as Route },
  { name: 'Debates', href: '/debates' as Route },
  { name: 'About', href: '/about' as Route },
]

export function Header() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-secondary-200 bg-white/80 backdrop-blur-sm">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8" aria-label="Top">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex flex-shrink-0 items-center">
            <Link href={'/' as Route} className="text-xl font-bold text-secondary-900">
              Debattle
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-6">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`text-sm font-medium ${
                  pathname === item.href
                    ? 'text-primary-600'
                    : 'text-secondary-600 hover:text-secondary-900'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Desktop Right Section */}
          <div className="hidden items-center justify-end md:flex md:flex-1 lg:w-0">
            {session ? (
              <div className="flex items-center space-x-4">
                <Link
                  href={'/debates/new' as Route}
                  className="text-sm font-medium text-primary-600 hover:text-primary-700"
                >
                  Start Debate
                </Link>
                <Link href={'/settings' as Route} className="text-sm font-medium text-secondary-600 hover:text-secondary-900">
                  Settings
                </Link>
                <Link href={`/users/${session.user.id}` as Route}>
                  <Image
                    className="rounded-full"
                    src={session.user.image || `https://ui-avatars.com/api/?name=${session.user.name}`}
                    alt={session.user.name}
                    width={32}
                    height={32}
                    priority
                  />
                </Link>
                <Button
                  variant="ghost"
                  onClick={() => signOut()}
                >
                  Sign out
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link href={'/login' as Route}>
                  <Button variant="ghost">Sign in</Button>
                </Link>
                <Link href={'/register' as Route}>
                  <Button>Sign up</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md p-2 text-secondary-400 hover:bg-secondary-100 hover:text-secondary-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              {isMobileMenuOpen ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="space-y-1 px-2 pb-3 pt-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`block rounded-md px-3 py-2 text-base font-medium ${
                    pathname === item.href
                      ? 'bg-primary-50 text-primary-600'
                      : 'text-secondary-600 hover:bg-secondary-50 hover:text-secondary-900'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
              {session ? (
                <>
                  <Link
                    href={'/debates/new' as Route}
                    className="block rounded-md px-3 py-2 text-base font-medium text-primary-600 hover:bg-primary-50 hover:text-primary-700"
                  >
                    Start Debate
                  </Link>
                  <Link
                    href={'/settings' as Route}
                    className="block rounded-md px-3 py-2 text-base font-medium text-secondary-600 hover:bg-secondary-50 hover:text-secondary-900"
                  >
                    Settings
                  </Link>
                  <button
                    onClick={() => signOut()}
                    className="block w-full rounded-md px-3 py-2 text-left text-base font-medium text-secondary-600 hover:bg-secondary-50 hover:text-secondary-900"
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href={'/login' as Route}
                    className="block rounded-md px-3 py-2 text-base font-medium text-secondary-600 hover:bg-secondary-50 hover:text-secondary-900"
                  >
                    Sign in
                  </Link>
                  <Link
                    href={'/register' as Route}
                    className="block rounded-md px-3 py-2 text-base font-medium text-primary-600 hover:bg-primary-50 hover:text-primary-700"
                  >
                    Sign up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  )
} 