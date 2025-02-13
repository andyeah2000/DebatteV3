'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { motion } from 'framer-motion'
import { Mail, Lock, User, Loader2, CheckCircle2, XCircle } from 'lucide-react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { cn } from '@/lib/utils'
import type { Route } from 'next'

// Dynamically import social buttons
const SocialButtons = dynamic(() => import('@/components/auth/SocialButtons'), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col space-y-4">
      <div className="h-10 w-full animate-pulse rounded bg-secondary/50" />
      <div className="h-10 w-full animate-pulse rounded bg-secondary/50" />
    </div>
  ),
})

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 }
}

interface ValidationState {
  isValid: boolean
  message: string
}

interface FormValidationState {
  username: ValidationState
  email: ValidationState
  password: ValidationState
  confirmPassword: ValidationState
}

export default function RegisterPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [validationState, setValidationState] = useState<FormValidationState>({
    username: { isValid: false, message: '' },
    email: { isValid: false, message: '' },
    password: { isValid: false, message: '' },
    confirmPassword: { isValid: false, message: '' }
  })

  const validateUsername = (username: string) => {
    if (!username) return { isValid: false, message: 'Username is required' }
    if (username.length < 3) return { isValid: false, message: 'Username must be at least 3 characters' }
    if (username.length > 30) return { isValid: false, message: 'Username must be less than 30 characters' }
    return { isValid: true, message: '✓ Username is valid' }
  }

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email) return { isValid: false, message: 'Email is required' }
    if (!emailRegex.test(email)) return { isValid: false, message: 'Please enter a valid email address' }
    return { isValid: true, message: '✓ Email is valid' }
  }

  const validatePassword = (password: string) => {
    if (!password) return { isValid: false, message: 'Password is required' }
    if (password.length < 8) return { isValid: false, message: 'Password must be at least 8 characters' }
    if (password.length > 50) return { isValid: false, message: 'Password must be less than 50 characters' }
    if (!/[A-Z]/.test(password)) return { isValid: false, message: 'Password must contain at least one uppercase letter' }
    if (!/[a-z]/.test(password)) return { isValid: false, message: 'Password must contain at least one lowercase letter' }
    if (!/[0-9]/.test(password)) return { isValid: false, message: 'Password must contain at least one number' }
    return { isValid: true, message: '✓ Password meets requirements' }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    let validation: ValidationState = { isValid: false, message: '' }
    
    switch (name) {
      case 'username':
        validation = validateUsername(value)
        break
      case 'email':
        validation = validateEmail(value)
        break
      case 'password':
        validation = validatePassword(value)
        // Update confirm password validation when password changes
        if (formData.confirmPassword) {
          setValidationState(prev => ({
            ...prev,
            confirmPassword: {
              isValid: formData.confirmPassword === value,
              message: formData.confirmPassword === value ? '✓ Passwords match' : 'Passwords do not match'
            }
          }))
        }
        break
      case 'confirmPassword':
        validation = {
          isValid: value === formData.password,
          message: value === formData.password ? '✓ Passwords match' : 'Passwords do not match'
        }
        break
    }

    setValidationState(prev => ({
      ...prev,
      [name]: validation
    }))
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)
    setError('')

    // Validate all fields
    const usernameValidation = validateUsername(formData.username)
    const emailValidation = validateEmail(formData.email)
    const passwordValidation = validatePassword(formData.password)
    const confirmPasswordValidation = {
      isValid: formData.password === formData.confirmPassword,
      message: formData.password === formData.confirmPassword ? '✓ Passwords match' : 'Passwords do not match'
    }

    setValidationState({
      username: usernameValidation,
      email: emailValidation,
      password: passwordValidation,
      confirmPassword: confirmPasswordValidation
    })

    if (!usernameValidation.isValid || !emailValidation.isValid || 
        !passwordValidation.isValid || !confirmPasswordValidation.isValid) {
      setIsLoading(false)
      setError('Please correct the highlighted fields')
      return
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/auth/register`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: formData.username,
            email: formData.email,
            password: formData.password,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed')
      }

      // Redirect to email verification page
      router.push('/verify-email' as Route)
    } catch (error) {
      console.error('Registration error:', error)
      setError(error instanceof Error ? error.message : 'Registration failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/5">
      <div className="container relative flex min-h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
        <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex">
          <div className="absolute inset-0 bg-zinc-900" />
          <div className="relative z-20 flex items-center text-lg font-medium">
            <Link href="/" className="flex items-center">
              <span className="text-xl font-bold">Debattle</span>
            </Link>
          </div>
          <motion.div 
            className="relative z-20 mt-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <blockquote className="space-y-2">
              <p className="text-lg">
                "Join our community of engaged citizens and contribute to meaningful political discourse."
              </p>
              <footer className="text-sm text-zinc-400">Debattle Community</footer>
            </blockquote>
          </motion.div>
        </div>
        <div className="p-4 lg:p-8">
          <motion.div
            className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]"
            variants={fadeIn}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <div className="flex flex-col space-y-2 text-center">
              <h1 className="text-2xl font-semibold tracking-tight">Create an account</h1>
              <p className="text-sm text-muted-foreground">
                Enter your details to get started
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <motion.div
                  className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="flex items-center">
                    <XCircle className="h-5 w-5 flex-shrink-0" />
                    <p className="ml-2">{error}</p>
                  </div>
                </motion.div>
              )}

              <div className="space-y-4">
                <div>
                  <Input
                    id="username"
                    name="username"
                    type="text"
                    placeholder="Username"
                    autoComplete="username"
                    required
                    icon={<User className="h-4 w-4 text-muted-foreground" />}
                    value={formData.username}
                    onChange={handleInputChange}
                    className={cn(
                      "bg-background border-input",
                      validationState.username.isValid && "border-green-500 focus-visible:ring-green-500"
                    )}
                  />
                  {validationState.username.message && (
                    <motion.p
                      className={cn(
                        "mt-1 text-xs",
                        validationState.username.isValid ? "text-green-500" : "text-destructive"
                      )}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      {validationState.username.message}
                    </motion.p>
                  )}
                </div>

                <div>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Email"
                    autoComplete="email"
                    required
                    icon={<Mail className="h-4 w-4 text-muted-foreground" />}
                    value={formData.email}
                    onChange={handleInputChange}
                    className={cn(
                      "bg-background border-input",
                      validationState.email.isValid && "border-green-500 focus-visible:ring-green-500"
                    )}
                  />
                  {validationState.email.message && (
                    <motion.p
                      className={cn(
                        "mt-1 text-xs",
                        validationState.email.isValid ? "text-green-500" : "text-destructive"
                      )}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      {validationState.email.message}
                    </motion.p>
                  )}
                </div>

                <div>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Password"
                    autoComplete="new-password"
                    required
                    icon={<Lock className="h-4 w-4 text-muted-foreground" />}
                    value={formData.password}
                    onChange={handleInputChange}
                    className={cn(
                      "bg-background border-input",
                      validationState.password.isValid && "border-green-500 focus-visible:ring-green-500"
                    )}
                  />
                  {validationState.password.message && (
                    <motion.p
                      className={cn(
                        "mt-1 text-xs",
                        validationState.password.isValid ? "text-green-500" : "text-destructive"
                      )}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      {validationState.password.message}
                    </motion.p>
                  )}
                </div>

                <div>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="Confirm password"
                    autoComplete="new-password"
                    required
                    icon={<Lock className="h-4 w-4 text-muted-foreground" />}
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={cn(
                      "bg-background border-input",
                      validationState.confirmPassword.isValid && "border-green-500 focus-visible:ring-green-500"
                    )}
                  />
                  {validationState.confirmPassword.message && (
                    <motion.p
                      className={cn(
                        "mt-1 text-xs",
                        validationState.confirmPassword.isValid ? "text-green-500" : "text-destructive"
                      )}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      {validationState.confirmPassword.message}
                    </motion.p>
                  )}
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90"
                disabled={isLoading}
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  'Create account'
                )}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>

            <SocialButtons isLoading={isLoading} />

            <p className="px-8 text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link 
                href="/login" 
                className="font-medium text-primary underline underline-offset-4 hover:text-primary/90"
              >
                Sign in
              </Link>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  )
} 