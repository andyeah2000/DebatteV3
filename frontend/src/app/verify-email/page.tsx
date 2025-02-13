'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, ArrowRight, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Alert } from '@/components/ui/alert'
import { useSearchParams } from 'next/navigation'

export default function VerifyEmailPage() {
  const [isResending, setIsResending] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const searchParams = useSearchParams()
  const email = searchParams.get('email')

  const handleResendVerification = async () => {
    setIsResending(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/auth/resend-verification`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to resend verification email')
      }

      setSuccess('Verification email has been resent. Please check your inbox.')
    } catch (error) {
      console.error('Resend verification error:', error)
      setError(error instanceof Error ? error.message : 'Failed to resend verification email')
    } finally {
      setIsResending(false)
    }
  }

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
            We've sent you a verification link to {email ? <strong>{email}</strong> : 'your email address'}.
            Please check your inbox and click the link to verify your account.
          </p>
        </div>

        {error && (
          <Alert variant="destructive" className="animate-in fade-in-50">
            {error}
          </Alert>
        )}

        {success && (
          <Alert className="border-green-500 text-green-500 animate-in fade-in-50">
            {success}
          </Alert>
        )}

        <div className="grid gap-4">
          <Link href="/login">
            <Button className="w-full" variant="outline">
              Back to login
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <button
            onClick={handleResendVerification}
            disabled={isResending}
            className="text-sm text-muted-foreground underline underline-offset-4 hover:text-primary disabled:opacity-50"
          >
            {isResending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin inline" />
                Resending...
              </>
            ) : (
              "Didn't receive the email? Click to resend"
            )}
          </button>
        </div>
      </motion.div>
    </div>
  )
} 