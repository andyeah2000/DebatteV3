'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import dynamic from 'next/dynamic'

// Dynamically import social buttons
const SocialButtons = dynamic(() => import('@/components/auth/SocialButtons'), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col space-y-4">
      <div className="h-10 w-full animate-pulse rounded bg-secondary-100 dark:bg-secondary-700" />
      <div className="h-10 w-full animate-pulse rounded bg-secondary-100 dark:bg-secondary-700" />
    </div>
  ),
})

// Route type for type safety
type AppRoutes = '/verify-email' | '/login' | '/'

// Validation functions
const validateUsername = (username: string) => {
  if (!username) return { isValid: false, message: 'Username ist erforderlich' }
  if (username.length < 3) return { isValid: false, message: 'Username muss mindestens 3 Zeichen haben' }
  if (username.length > 30) return { isValid: false, message: 'Username darf maximal 30 Zeichen haben' }
  return { isValid: true, message: '✓ Username ist gültig' }
}

const validateEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!email) return { isValid: false, message: 'Email ist erforderlich' }
  if (!emailRegex.test(email)) return { isValid: false, message: 'Bitte geben Sie eine gültige Email-Adresse ein' }
  return { isValid: true, message: '✓ Email ist gültig' }
}

const validatePassword = (password: string) => {
  if (!password) return { isValid: false, message: 'Passwort ist erforderlich' }
  if (password.length < 8) return { isValid: false, message: 'Passwort muss mindestens 8 Zeichen haben' }
  if (password.length > 50) return { isValid: false, message: 'Passwort darf maximal 50 Zeichen haben' }
  return { isValid: true, message: '✓ Passwort ist gültig' }
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
  const [validationState, setValidationState] = useState<FormValidationState>({
    username: { isValid: false, message: '' },
    email: { isValid: false, message: '' },
    password: { isValid: false, message: '' },
    confirmPassword: { isValid: false, message: '' }
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    let validation: ValidationState = { isValid: false, message: '' }
    const password = (document.getElementById('password') as HTMLInputElement)?.value

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
        if (password) {
          const confirmPassword = (document.getElementById('confirmPassword') as HTMLInputElement)?.value
          setValidationState(prev => ({
            ...prev,
            confirmPassword: {
              isValid: confirmPassword === value,
              message: confirmPassword === value ? '✓ Passwörter stimmen überein' : 'Passwörter stimmen nicht überein'
            }
          }))
        }
        break
      case 'confirmPassword':
        validation = {
          isValid: value === password,
          message: value === password ? '✓ Passwörter stimmen überein' : 'Passwörter stimmen nicht überein'
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

    const formData = new FormData(event.currentTarget)
    const username = formData.get('username') as string
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const confirmPassword = formData.get('confirmPassword') as string

    // Validate all fields
    const usernameValidation = validateUsername(username)
    const emailValidation = validateEmail(email)
    const passwordValidation = validatePassword(password)
    const confirmPasswordValidation = {
      isValid: password === confirmPassword,
      message: password === confirmPassword ? '✓ Passwörter stimmen überein' : 'Passwörter stimmen nicht überein'
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
      setError('Bitte korrigieren Sie die markierten Felder')
      return
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          email,
          password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed')
      }

      // Sign in the user after successful registration
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        throw new Error(result.error)
      }

      // Use window.location for navigation after registration
      window.location.href = '/verify-email'
    } catch (error) {
      console.error('Registration error:', error)
      setError(error instanceof Error ? error.message : 'Registration failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl">
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-secondary-900 dark:text-white">
          Create your account
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl">
        <div className="bg-white px-6 py-8 shadow dark:bg-secondary-800 sm:rounded-lg sm:px-12">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="rounded-md bg-red-50 p-4 dark:bg-red-900/50">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800 dark:text-red-200">{error}</h3>
                  </div>
                </div>
              </div>
            )}

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-secondary-700 dark:text-secondary-200">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                onChange={handleInputChange}
                className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-1 sm:text-sm ${
                  validationState.username.isValid
                    ? 'border-green-300 focus:border-green-500 focus:ring-green-500 dark:border-green-600'
                    : 'border-secondary-300 focus:border-primary-500 focus:ring-primary-500 dark:border-secondary-600'
                }`}
              />
              {validationState.username.message && (
                <p className={`mt-1 text-sm ${
                  validationState.username.isValid ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                }`}>
                  {validationState.username.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-secondary-700 dark:text-secondary-200">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                onChange={handleInputChange}
                className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-1 sm:text-sm ${
                  validationState.email.isValid
                    ? 'border-green-300 focus:border-green-500 focus:ring-green-500 dark:border-green-600'
                    : 'border-secondary-300 focus:border-primary-500 focus:ring-primary-500 dark:border-secondary-600'
                }`}
              />
              {validationState.email.message && (
                <p className={`mt-1 text-sm ${
                  validationState.email.isValid ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                }`}>
                  {validationState.email.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-secondary-700 dark:text-secondary-200">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                onChange={handleInputChange}
                className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-1 sm:text-sm ${
                  validationState.password.isValid
                    ? 'border-green-300 focus:border-green-500 focus:ring-green-500 dark:border-green-600'
                    : 'border-secondary-300 focus:border-primary-500 focus:ring-primary-500 dark:border-secondary-600'
                }`}
              />
              {validationState.password.message && (
                <p className={`mt-1 text-sm ${
                  validationState.password.isValid ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                }`}>
                  {validationState.password.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-secondary-700 dark:text-secondary-200">
                Confirm password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                onChange={handleInputChange}
                className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-1 sm:text-sm ${
                  validationState.confirmPassword.isValid
                    ? 'border-green-300 focus:border-green-500 focus:ring-green-500 dark:border-green-600'
                    : 'border-secondary-300 focus:border-primary-500 focus:ring-primary-500 dark:border-secondary-600'
                }`}
              />
              {validationState.confirmPassword.message && (
                <p className={`mt-1 text-sm ${
                  validationState.confirmPassword.isValid ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                }`}>
                  {validationState.confirmPassword.message}
                </p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Creating account...' : 'Create account'}
            </Button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-secondary-300 dark:border-secondary-600" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-2 text-secondary-500 dark:bg-secondary-800 dark:text-secondary-400">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="mt-6">
              <SocialButtons isLoading={isLoading} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 