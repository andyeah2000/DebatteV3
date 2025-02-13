'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function RegisterPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [validationState, setValidationState] = useState({
    username: { isValid: false, message: '' },
    email: { isValid: false, message: '' },
    password: { isValid: false, message: '' },
    confirmPassword: { isValid: false, message: '' }
  })

  // Validierungsfunktionen
  const validateUsername = (username: string) => {
    if (!username) {
      return { isValid: false, message: 'Username ist erforderlich' }
    }
    if (username.length < 3) {
      return { isValid: false, message: 'Username muss mindestens 3 Zeichen haben' }
    }
    if (username.length > 30) {
      return { isValid: false, message: 'Username darf maximal 30 Zeichen haben' }
    }
    return { isValid: true, message: '✓ Username ist gültig' }
  }

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email) {
      return { isValid: false, message: 'Email ist erforderlich' }
    }
    if (!emailRegex.test(email)) {
      return { isValid: false, message: 'Bitte geben Sie eine gültige Email-Adresse ein' }
    }
    return { isValid: true, message: '✓ Email ist gültig' }
  }

  const validatePassword = (password: string) => {
    if (!password) {
      return { isValid: false, message: 'Passwort ist erforderlich' }
    }
    if (password.length < 8) {
      return { isValid: false, message: 'Passwort muss mindestens 8 Zeichen haben' }
    }
    if (password.length > 50) {
      return { isValid: false, message: 'Passwort darf maximal 50 Zeichen haben' }
    }
    return { isValid: true, message: '✓ Passwort ist gültig' }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    let validation = { isValid: false, message: '' }
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

    // Validiere alle Felder
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

    // Prüfe ob alle Validierungen erfolgreich sind
    if (!usernameValidation.isValid || !emailValidation.isValid || 
        !passwordValidation.isValid || !confirmPasswordValidation.isValid) {
      setIsLoading(false)
      setError('Bitte korrigieren Sie die markierten Felder')
      return
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Registrierung fehlgeschlagen')
      }

      // Erfolgsmeldung anzeigen
      setError('')
      
      // Sign in nach erfolgreicher Registrierung
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
        callbackUrl: '/'
      })

      if (result?.error) {
        console.error('Sign in error:', result.error)
        setError('Registrierung erfolgreich, aber automatische Anmeldung fehlgeschlagen. Bitte melden Sie sich manuell an.')
        router.push('/login?registered=true')
        return
      }

      if (result?.url) {
        router.push(result.url)
      } else {
        router.push('/')
      }
      router.refresh()
    } catch (error) {
      console.error('Registration error:', error)
      setError(error instanceof Error ? error.message : 'Registrierung fehlgeschlagen')
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
        <p className="mt-2 text-center text-sm text-secondary-600 dark:text-secondary-400">
          Or{' '}
          <Link
            href="/login"
            className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
          >
            sign in to your existing account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl">
        <div className="bg-white px-6 py-8 shadow dark:bg-secondary-800 sm:rounded-lg sm:px-12">
          <div className="flex flex-col space-y-4">
            <Button
              type="button"
              variant="outline"
              className="flex w-full items-center justify-center space-x-2"
              onClick={() => signIn('google', { callbackUrl: '/' })}
              disabled={isLoading}
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              <span>Continue with Google</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              className="flex w-full items-center justify-center space-x-2"
              onClick={() => signIn('github', { callbackUrl: '/' })}
              disabled={isLoading}
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path
                  fillRule="evenodd"
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Continue with GitHub</span>
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-secondary-200 dark:border-secondary-700" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-2 text-secondary-500 dark:bg-secondary-800 dark:text-secondary-400">
                  Or continue with
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="rounded-md bg-red-50 p-4 dark:bg-red-900/10">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-5 w-5 text-red-400 dark:text-red-500"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-700 dark:text-red-400">
                        {error}
                        {error.includes('login') && (
                          <>
                            {' '}
                            <Link
                              href="/login"
                              className="font-medium underline hover:text-red-600 dark:hover:text-red-300"
                            >
                              Sign in here
                            </Link>
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label
                  htmlFor="username"
                  className="block text-sm font-medium text-secondary-700 dark:text-secondary-300"
                >
                  Username
                </label>
                <div className="mt-1">
                  <input
                    id="username"
                    name="username"
                    type="text"
                    autoComplete="username"
                    required
                    onChange={handleInputChange}
                    className={`block w-full appearance-none rounded-md border px-3 py-2 shadow-sm placeholder:text-secondary-400 focus:outline-none focus:ring-primary-500 dark:bg-secondary-800 dark:text-white dark:placeholder:text-secondary-500 sm:text-sm ${
                      validationState.username.isValid 
                        ? 'border-green-500 focus:border-green-500' 
                        : validationState.username.message 
                          ? 'border-red-500 focus:border-red-500' 
                          : 'border-secondary-300 focus:border-primary-500 dark:border-secondary-700'
                    }`}
                  />
                  {validationState.username.message && (
                    <p className={`mt-1 text-sm ${validationState.username.isValid ? 'text-green-500' : 'text-red-500'}`}>
                      {validationState.username.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-secondary-700 dark:text-secondary-300"
                >
                  Email address
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    onChange={handleInputChange}
                    className={`block w-full appearance-none rounded-md border px-3 py-2 shadow-sm placeholder:text-secondary-400 focus:outline-none focus:ring-primary-500 dark:bg-secondary-800 dark:text-white dark:placeholder:text-secondary-500 sm:text-sm ${
                      validationState.email.isValid 
                        ? 'border-green-500 focus:border-green-500' 
                        : validationState.email.message 
                          ? 'border-red-500 focus:border-red-500' 
                          : 'border-secondary-300 focus:border-primary-500 dark:border-secondary-700'
                    }`}
                  />
                  {validationState.email.message && (
                    <p className={`mt-1 text-sm ${validationState.email.isValid ? 'text-green-500' : 'text-red-500'}`}>
                      {validationState.email.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-secondary-700 dark:text-secondary-300"
                >
                  Password
                </label>
                <div className="mt-1">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    onChange={handleInputChange}
                    className={`block w-full appearance-none rounded-md border px-3 py-2 shadow-sm placeholder:text-secondary-400 focus:outline-none focus:ring-primary-500 dark:bg-secondary-800 dark:text-white dark:placeholder:text-secondary-500 sm:text-sm ${
                      validationState.password.isValid 
                        ? 'border-green-500 focus:border-green-500' 
                        : validationState.password.message 
                          ? 'border-red-500 focus:border-red-500' 
                          : 'border-secondary-300 focus:border-primary-500 dark:border-secondary-700'
                    }`}
                  />
                  {validationState.password.message && (
                    <p className={`mt-1 text-sm ${validationState.password.isValid ? 'text-green-500' : 'text-red-500'}`}>
                      {validationState.password.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-secondary-700 dark:text-secondary-300"
                >
                  Confirm password
                </label>
                <div className="mt-1">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    onChange={handleInputChange}
                    className={`block w-full appearance-none rounded-md border px-3 py-2 shadow-sm placeholder:text-secondary-400 focus:outline-none focus:ring-primary-500 dark:bg-secondary-800 dark:text-white dark:placeholder:text-secondary-500 sm:text-sm ${
                      validationState.confirmPassword.isValid 
                        ? 'border-green-500 focus:border-green-500' 
                        : validationState.confirmPassword.message 
                          ? 'border-red-500 focus:border-red-500' 
                          : 'border-secondary-300 focus:border-primary-500 dark:border-secondary-700'
                    }`}
                  />
                  {validationState.confirmPassword.message && (
                    <p className={`mt-1 text-sm ${validationState.confirmPassword.isValid ? 'text-green-500' : 'text-red-500'}`}>
                      {validationState.confirmPassword.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  required
                  className="h-4 w-4 rounded border-secondary-300 text-primary-600 focus:ring-primary-500 dark:border-secondary-700 dark:bg-secondary-800"
                />
                <label
                  htmlFor="terms"
                  className="ml-2 block text-sm text-secondary-700 dark:text-secondary-300"
                >
                  I agree to the{' '}
                  <a
                    href="/terms"
                    className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
                  >
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a
                    href="/privacy"
                    className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
                  >
                    Privacy Policy
                  </a>
                </label>
              </div>

              <div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading || !Object.values(validationState).every(v => v.isValid)}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Creating account...
                    </div>
                  ) : (
                    'Create account'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
} 