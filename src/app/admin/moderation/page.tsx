'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface ReportedContent {
  id: string
  type: 'debate' | 'comment'
  content: string
  reason: string
  reportedBy: {
    id: string
    username: string
  }
  createdAt: string
  status: 'pending' | 'approved' | 'rejected'
  originalContent: {
    id: string
    title?: string
    content: string
    author: {
      id: string
      username: string
    }
  }
}

export default function ModerationPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [reportedContent, setReportedContent] = useState<ReportedContent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  useEffect(() => {
    async function fetchReportedContent() {
      try {
        const response = await fetch('/api/graphql', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session?.accessToken}`,
          },
          body: JSON.stringify({
            query: `
              query GetReportedContent {
                getReportedContent {
                  id
                  type
                  content
                  reason
                  reportedBy {
                    id
                    username
                  }
                  createdAt
                  status
                  originalContent {
                    id
                    title
                    content
                    author {
                      id
                      username
                    }
                  }
                }
              }
            `,
          }),
        })

        const result = await response.json()
        if (result.errors) {
          throw new Error(result.errors[0].message)
        }

        setReportedContent(result.data.getReportedContent)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch reported content')
      } finally {
        setLoading(false)
      }
    }

    if (session?.accessToken) {
      fetchReportedContent()
    }
  }, [session])

  async function handleModeration(contentId: string, action: 'approve' | 'reject') {
    try {
      const response = await fetch('/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.accessToken}`,
        },
        body: JSON.stringify({
          query: `
            mutation ModerateContent($contentId: ID!, $action: String!) {
              moderateContent(contentId: $contentId, action: $action)
            }
          `,
          variables: { contentId, action },
        }),
      })

      const result = await response.json()
      if (result.errors) {
        throw new Error(result.errors[0].message)
      }

      // Update local state
      setReportedContent((prev) =>
        prev.map((item) =>
          item.id === contentId ? { ...item, status: action === 'approve' ? 'approved' : 'rejected' } : item
        )
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to moderate content')
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-32 rounded-lg bg-secondary-200 dark:bg-secondary-700"
            />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="rounded-lg bg-red-50 p-4 dark:bg-red-900/10">
          <p className="text-red-700 dark:text-red-400">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        className="space-y-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-secondary-900 dark:text-white">
            Content Moderation
          </h1>
          <Link href="/admin">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </div>

        <div className="space-y-4">
          {reportedContent.map((report) => (
            <motion.div
              key={report.id}
              className="rounded-lg bg-white p-6 shadow-sm dark:bg-secondary-800"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800 dark:bg-red-900/20 dark:text-red-400">
                    {report.type}
                  </span>
                  <span className="ml-2 text-sm text-secondary-500 dark:text-secondary-400">
                    Reported {new Date(report.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex space-x-2">
                  <Button
                    onClick={() => handleModeration(report.id, 'approve')}
                    variant="outline"
                    className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
                    disabled={report.status !== 'pending'}
                  >
                    Approve
                  </Button>
                  <Button
                    onClick={() => handleModeration(report.id, 'reject')}
                    variant="outline"
                    className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                    disabled={report.status !== 'pending'}
                  >
                    Reject
                  </Button>
                </div>
              </div>

              <div className="mb-4 rounded-lg bg-secondary-50 p-4 dark:bg-secondary-900">
                <h3 className="mb-2 font-medium text-secondary-900 dark:text-white">
                  {report.type === 'debate' ? 'Debate Title: ' : 'Comment: '}
                  {report.originalContent.title || report.originalContent.content}
                </h3>
                <p className="text-sm text-secondary-600 dark:text-secondary-400">
                  by {report.originalContent.author.username}
                </p>
              </div>

              <div className="mb-4">
                <h4 className="mb-1 text-sm font-medium text-secondary-900 dark:text-white">
                  Report Reason:
                </h4>
                <p className="text-secondary-600 dark:text-secondary-400">
                  {report.reason}
                </p>
              </div>

              <div className="text-sm text-secondary-500 dark:text-secondary-400">
                Reported by {report.reportedBy.username}
              </div>

              {report.status !== 'pending' && (
                <div className="mt-4 text-sm">
                  <span
                    className={`font-medium ${
                      report.status === 'approved'
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}
                  >
                    {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                  </span>
                </div>
              )}
            </motion.div>
          ))}

          {reportedContent.length === 0 && (
            <div className="rounded-lg bg-white p-8 text-center dark:bg-secondary-800">
              <p className="text-secondary-600 dark:text-secondary-400">
                No reported content to moderate
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
} 