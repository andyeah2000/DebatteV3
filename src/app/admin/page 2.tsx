'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

interface Analytics {
  id: string
  type: string
  period: string
  totalUsers: number
  activeUsers: number
  newUsers: number
  totalDebates: number
  activeDebates: number
  totalComments: number
  totalVotes: number
  averageDebateQuality: number
  averageEngagementRate: number
  timestamp: string
  data: {
    userGrowth: string
    engagementRate: string
    topCategories: Array<{ name: string; count: number }>
    popularDebates: Array<{ id: string; title: string; participants: number }>
  }
}

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily')
  const [analytics, setAnalytics] = useState<Analytics[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const response = await fetch('/api/graphql', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session?.accessToken}`,
          },
          body: JSON.stringify({
            query: `
              query GetAnalytics($period: String!) {
                getAnalytics(period: $period) {
                  id
                  type
                  period
                  totalUsers
                  activeUsers
                  newUsers
                  totalDebates
                  activeDebates
                  totalComments
                  totalVotes
                  averageDebateQuality
                  averageEngagementRate
                  timestamp
                  data
                }
              }
            `,
            variables: { period },
          }),
        })

        const result = await response.json()
        if (result.errors) {
          throw new Error(result.errors[0].message)
        }

        setAnalytics(result.data.getAnalytics)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch analytics')
      } finally {
        setLoading(false)
      }
    }

    if (session?.accessToken) {
      fetchAnalytics()
    }
  }, [session, period])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 rounded bg-secondary-200 dark:bg-secondary-700" />
          <div className="h-64 rounded bg-secondary-200 dark:bg-secondary-700" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-32 rounded bg-secondary-200 dark:bg-secondary-700"
              />
            ))}
          </div>
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

  const latestAnalytics = analytics[0]

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
            Admin Dashboard
          </h1>
          <div className="flex space-x-2">
            {(['daily', 'weekly', 'monthly'] as const).map((p) => (
              <Button
                key={p}
                onClick={() => setPeriod(p)}
                variant={period === p ? 'default' : 'outline'}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              title: 'Total Users',
              value: latestAnalytics?.totalUsers.toLocaleString(),
              change: latestAnalytics?.data.userGrowth + '%',
              trend: 'up',
            },
            {
              title: 'Active Debates',
              value: latestAnalytics?.activeDebates.toLocaleString(),
              change: '+5.2%',
              trend: 'up',
            },
            {
              title: 'Engagement Rate',
              value: latestAnalytics?.averageEngagementRate.toFixed(1) + '%',
              change: latestAnalytics?.data.engagementRate + '%',
              trend: 'up',
            },
            {
              title: 'Debate Quality',
              value: latestAnalytics?.averageDebateQuality.toFixed(1) + '%',
              change: '+2.3%',
              trend: 'up',
            },
          ].map((metric) => (
            <motion.div
              key={metric.title}
              className="rounded-lg bg-white p-6 shadow-sm dark:bg-secondary-800"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <h3 className="text-sm font-medium text-secondary-500 dark:text-secondary-400">
                {metric.title}
              </h3>
              <div className="mt-2 flex items-baseline">
                <p className="text-2xl font-semibold text-secondary-900 dark:text-white">
                  {metric.value}
                </p>
                <span
                  className={`ml-2 text-sm ${
                    metric.trend === 'up'
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}
                >
                  {metric.change}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Charts */}
        <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-secondary-800">
          <h2 className="mb-4 text-lg font-semibold text-secondary-900 dark:text-white">
            User Activity
          </h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={analytics}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="timestamp"
                  tickFormatter={(value) => new Date(value).toLocaleDateString()}
                />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="activeUsers"
                  stroke="#0ea5e9"
                  name="Active Users"
                />
                <Line
                  type="monotone"
                  dataKey="newUsers"
                  stroke="#22c55e"
                  name="New Users"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Popular Debates */}
        <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-secondary-800">
          <h2 className="mb-4 text-lg font-semibold text-secondary-900 dark:text-white">
            Popular Debates
          </h2>
          <div className="space-y-4">
            {latestAnalytics?.data.popularDebates.map((debate) => (
              <div
                key={debate.id}
                className="flex items-center justify-between rounded-lg border border-secondary-200 p-4 dark:border-secondary-700"
              >
                <span className="font-medium text-secondary-900 dark:text-white">
                  {debate.title}
                </span>
                <span className="text-sm text-secondary-500 dark:text-secondary-400">
                  {debate.participants} participants
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Categories */}
        <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-secondary-800">
          <h2 className="mb-4 text-lg font-semibold text-secondary-900 dark:text-white">
            Top Categories
          </h2>
          <div className="space-y-4">
            {latestAnalytics?.data.topCategories.map((category) => (
              <div
                key={category.name}
                className="flex items-center justify-between"
              >
                <span className="text-secondary-900 dark:text-white">
                  {category.name}
                </span>
                <div className="flex items-center">
                  <div className="mr-4 h-2 w-24 overflow-hidden rounded-full bg-secondary-200 dark:bg-secondary-700">
                    <div
                      className="h-full bg-primary-600 dark:bg-primary-400"
                      style={{
                        width: `${(category.count / latestAnalytics.totalDebates) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="text-sm text-secondary-500 dark:text-secondary-400">
                    {category.count} debates
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  )
} 