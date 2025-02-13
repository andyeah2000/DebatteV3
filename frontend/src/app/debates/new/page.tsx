'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { CREATE_DEBATE } from '@/graphql/mutations'

interface DebateFormData {
  title: string
  description: string
  category: string
  tags: string[]
  scheduledEndTime?: Date
}

const CATEGORIES = [
  'Politics',
  'Economics',
  'Technology',
  'Environment',
  'Society',
  'Education',
  'Healthcare',
  'Culture',
]

export default function NewDebatePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState<DebateFormData>({
    title: '',
    description: '',
    category: '',
    tags: [],
  })

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: CREATE_DEBATE,
          variables: {
            input: formData,
          },
        }),
      })

      const data = await response.json()

      if (data.errors) {
        throw new Error(data.errors[0].message)
      }

      router.push(`/debates/${data.data.createDebate.id}`)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create debate')
    } finally {
      setIsLoading(false)
    }
  }

  function handleTagInput(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault()
      const value = (event.target as HTMLInputElement).value.trim()
      if (value && !formData.tags.includes(value)) {
        setFormData(prev => ({
          ...prev,
          tags: [...prev.tags, value],
        }))
        ;(event.target as HTMLInputElement).value = ''
      }
    }
  }

  function removeTag(tagToRemove: string) {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove),
    }))
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="mb-8 text-3xl font-bold text-secondary-900 dark:text-white">
          Start a New Debate
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

          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-secondary-700 dark:text-secondary-300"
            >
              Title
            </label>
            <div className="mt-1">
              <input
                type="text"
                id="title"
                required
                minLength={5}
                maxLength={200}
                value={formData.title}
                onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="block w-full rounded-md border border-secondary-300 px-4 py-2 shadow-sm placeholder:text-secondary-400 focus:border-primary-500 focus:ring-primary-500 dark:border-secondary-700 dark:bg-secondary-800 dark:text-white dark:placeholder:text-secondary-500"
                placeholder="Enter a clear, specific title for your debate"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-secondary-700 dark:text-secondary-300"
            >
              Description
            </label>
            <div className="mt-1">
              <textarea
                id="description"
                required
                minLength={20}
                maxLength={5000}
                rows={6}
                value={formData.description}
                onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="block w-full rounded-md border border-secondary-300 px-4 py-2 shadow-sm placeholder:text-secondary-400 focus:border-primary-500 focus:ring-primary-500 dark:border-secondary-700 dark:bg-secondary-800 dark:text-white dark:placeholder:text-secondary-500"
                placeholder="Provide context and background information for your debate topic"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="category"
              className="block text-sm font-medium text-secondary-700 dark:text-secondary-300"
            >
              Category
            </label>
            <div className="mt-1">
              <select
                id="category"
                required
                value={formData.category}
                onChange={e => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="block w-full rounded-md border border-secondary-300 px-4 py-2 shadow-sm placeholder:text-secondary-400 focus:border-primary-500 focus:ring-primary-500 dark:border-secondary-700 dark:bg-secondary-800 dark:text-white dark:placeholder:text-secondary-500"
              >
                <option value="">Select a category</option>
                {CATEGORIES.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label
              htmlFor="tags"
              className="block text-sm font-medium text-secondary-700 dark:text-secondary-300"
            >
              Tags
            </label>
            <div className="mt-1">
              <input
                type="text"
                id="tags"
                onKeyDown={handleTagInput}
                className="block w-full rounded-md border border-secondary-300 px-4 py-2 shadow-sm placeholder:text-secondary-400 focus:border-primary-500 focus:ring-primary-500 dark:border-secondary-700 dark:bg-secondary-800 dark:text-white dark:placeholder:text-secondary-500"
                placeholder="Add tags (press Enter or comma to add)"
              />
              <div className="mt-2 flex flex-wrap gap-2">
                {formData.tags.map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center rounded-full bg-primary-100 px-3 py-1 text-sm font-medium text-primary-700 dark:bg-primary-900/20 dark:text-primary-400"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-2 inline-flex h-4 w-4 items-center justify-center rounded-full hover:bg-primary-200 dark:hover:bg-primary-900/40"
                    >
                      <span className="sr-only">Remove tag</span>
                      <svg
                        className="h-3 w-3"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label
              htmlFor="scheduledEndTime"
              className="block text-sm font-medium text-secondary-700 dark:text-secondary-300"
            >
              Scheduled End Time (Optional)
            </label>
            <div className="mt-1">
              <input
                type="datetime-local"
                id="scheduledEndTime"
                value={formData.scheduledEndTime?.toISOString().slice(0, 16) || ''}
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    scheduledEndTime: e.target.value ? new Date(e.target.value) : undefined,
                  }))
                }
                className="block w-full rounded-md border border-secondary-300 px-4 py-2 shadow-sm placeholder:text-secondary-400 focus:border-primary-500 focus:ring-primary-500 dark:border-secondary-700 dark:bg-secondary-800 dark:text-white dark:placeholder:text-secondary-500"
              />
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
              {isLoading ? 'Creating...' : 'Create Debate'}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  )
} 