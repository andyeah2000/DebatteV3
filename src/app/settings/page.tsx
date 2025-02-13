'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'

interface SettingsFormData {
  username: string
  email: string
  bio?: string
  currentPassword?: string
  newPassword?: string
  confirmPassword?: string
}

export default function SettingsPage() {
  const router = useRouter()
  const { data: session, update } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [formData, setFormData] = useState<SettingsFormData>({
    username: session?.user?.name || '',
    email: session?.user?.email || '',
    bio: '',
  })

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)
    setError('')
    setSuccessMessage('')

    // Validate passwords if changing
    if (formData.newPassword) {
      if (!formData.currentPassword) {
        setError('Current password is required to set a new password')
        setIsLoading(false)
        return
      }
      if (formData.newPassword !== formData.confirmPassword) {
        setError('New passwords do not match')
        setIsLoading(false)
        return
      }
    }

    try {
      const response = await fetch('/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            mutation UpdateUser($input: UpdateUserInput!) {
              updateUser(updateUserInput: $input) {
                id
                username
                email
                bio
              }
            }
          `,
          variables: {
            input: {
              username: formData.username,
              bio: formData.bio,
              currentPassword: formData.currentPassword,
              newPassword: formData.newPassword,
            },
          },
        }),
      })

      const data = await response.json()

      if (data.errors) {
        throw new Error(data.errors[0].message)
      }

      // Update session with new user data
      await update({
        ...session,
        user: {
          ...session?.user,
          name: data.data.updateUser.username,
          email: data.data.updateUser.email,
        },
      })

      setSuccessMessage('Profile updated successfully')
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update profile')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="mb-8 text-3xl font-bold text-secondary-900 dark:text-white">
          Settings
        </h1>

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
                  <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
                </div>
              </div>
            </div>
          )}

          {successMessage && (
            <div className="rounded-md bg-green-50 p-4 dark:bg-green-900/10">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-green-400 dark:text-green-500"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-green-700 dark:text-green-400">
                    {successMessage}
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
                type="text"
                id="username"
                required
                value={formData.username}
                onChange={e => setFormData(prev => ({ ...prev, username: e.target.value }))}
                className="block w-full rounded-md border border-secondary-300 px-4 py-2 shadow-sm placeholder:text-secondary-400 focus:border-primary-500 focus:ring-primary-500 dark:border-secondary-700 dark:bg-secondary-800 dark:text-white dark:placeholder:text-secondary-500"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-secondary-700 dark:text-secondary-300"
            >
              Email
            </label>
            <div className="mt-1">
              <input
                type="email"
                id="email"
                required
                value={formData.email}
                disabled
                className="block w-full rounded-md border border-secondary-300 bg-secondary-100 px-4 py-2 shadow-sm placeholder:text-secondary-400 dark:border-secondary-700 dark:bg-secondary-800 dark:text-secondary-400"
              />
              <p className="mt-1 text-sm text-secondary-500 dark:text-secondary-400">
                Email cannot be changed
              </p>
            </div>
          </div>

          <div>
            <label
              htmlFor="bio"
              className="block text-sm font-medium text-secondary-700 dark:text-secondary-300"
            >
              Bio
            </label>
            <div className="mt-1">
              <textarea
                id="bio"
                rows={4}
                value={formData.bio}
                onChange={e => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                className="block w-full rounded-md border border-secondary-300 px-4 py-2 shadow-sm placeholder:text-secondary-400 focus:border-primary-500 focus:ring-primary-500 dark:border-secondary-700 dark:bg-secondary-800 dark:text-white dark:placeholder:text-secondary-500"
                placeholder="Tell us about yourself"
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium text-secondary-900 dark:text-white">
              Change Password
            </h3>

            <div>
              <label
                htmlFor="currentPassword"
                className="block text-sm font-medium text-secondary-700 dark:text-secondary-300"
              >
                Current Password
              </label>
              <div className="mt-1">
                <input
                  type="password"
                  id="currentPassword"
                  value={formData.currentPassword || ''}
                  onChange={e =>
                    setFormData(prev => ({ ...prev, currentPassword: e.target.value }))
                  }
                  className="block w-full rounded-md border border-secondary-300 px-4 py-2 shadow-sm placeholder:text-secondary-400 focus:border-primary-500 focus:ring-primary-500 dark:border-secondary-700 dark:bg-secondary-800 dark:text-white dark:placeholder:text-secondary-500"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="newPassword"
                className="block text-sm font-medium text-secondary-700 dark:text-secondary-300"
              >
                New Password
              </label>
              <div className="mt-1">
                <input
                  type="password"
                  id="newPassword"
                  value={formData.newPassword || ''}
                  onChange={e =>
                    setFormData(prev => ({ ...prev, newPassword: e.target.value }))
                  }
                  className="block w-full rounded-md border border-secondary-300 px-4 py-2 shadow-sm placeholder:text-secondary-400 focus:border-primary-500 focus:ring-primary-500 dark:border-secondary-700 dark:bg-secondary-800 dark:text-white dark:placeholder:text-secondary-500"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-secondary-700 dark:text-secondary-300"
              >
                Confirm New Password
              </label>
              <div className="mt-1">
                <input
                  type="password"
                  id="confirmPassword"
                  value={formData.confirmPassword || ''}
                  onChange={e =>
                    setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))
                  }
                  className="block w-full rounded-md border border-secondary-300 px-4 py-2 shadow-sm placeholder:text-secondary-400 focus:border-primary-500 focus:ring-primary-500 dark:border-secondary-700 dark:bg-secondary-800 dark:text-white dark:placeholder:text-secondary-500"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  )
} 