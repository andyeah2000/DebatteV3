'use client'

import { motion } from 'framer-motion'
import { Mail, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function VerifyEmailPage() {
  return (
    <div className="container relative flex min-h-screen flex-col items-center justify-center">
      <motion.div
        className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
      >
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="rounded-full bg-secondary/20 p-4">
            <Mail className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Check your email
          </h1>
          <p className="text-sm text-muted-foreground">
            We've sent you a verification link to your email address.
            Please check your inbox and click the link to verify your account.
          </p>
        </div>

        <div className="grid gap-4">
          <Link href="/login">
            <Button className="w-full" variant="outline">
              Back to login
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <p className="px-8 text-center text-sm text-muted-foreground">
            Didn't receive the email?{' '}
            <button className="underline underline-offset-4 hover:text-primary">
              Click to resend
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  )
} 