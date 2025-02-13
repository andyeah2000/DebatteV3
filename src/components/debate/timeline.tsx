'use client'

import { motion } from 'framer-motion'
import { TimelineEvent, DebatePhase } from '@/types/debate'
import { formatDate } from '@/lib/utils'

interface TimelineProps {
  events: TimelineEvent[]
  phases: DebatePhase[]
  currentPhase: string
}

function getEventIcon(type: TimelineEvent['type']) {
  switch (type) {
    case 'comment':
      return (
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
          />
        </svg>
      )
    case 'vote':
      return (
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 15l7-7 7 7"
          />
        </svg>
      )
    case 'status_change':
      return (
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
      )
    case 'milestone':
      return (
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
          />
        </svg>
      )
  }
}

function getEventColor(type: TimelineEvent['type']) {
  switch (type) {
    case 'comment':
      return 'text-blue-500 bg-blue-100 dark:bg-blue-900/20'
    case 'vote':
      return 'text-green-500 bg-green-100 dark:bg-green-900/20'
    case 'status_change':
      return 'text-yellow-500 bg-yellow-100 dark:bg-yellow-900/20'
    case 'milestone':
      return 'text-purple-500 bg-purple-100 dark:bg-purple-900/20'
  }
}

function PhaseIndicator({ phase, isActive }: { phase: DebatePhase; isActive: boolean }) {
  return (
    <div
      className={`flex items-center space-x-2 rounded-full px-3 py-1 text-sm ${
        isActive
          ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400'
          : 'bg-secondary-100 text-secondary-700 dark:bg-secondary-800 dark:text-secondary-400'
      }`}
    >
      <span>{phase.name}</span>
      {isActive && (
        <span className="flex h-2 w-2">
          <span className="absolute inline-flex h-2 w-2 animate-ping rounded-full bg-primary-400 opacity-75"></span>
          <span className="relative inline-flex h-2 w-2 rounded-full bg-primary-500"></span>
        </span>
      )}
    </div>
  )
}

export function Timeline({ events, phases, currentPhase }: TimelineProps) {
  return (
    <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-secondary-800">
      <h3 className="mb-6 text-lg font-semibold text-secondary-900 dark:text-white">
        Debate Timeline
      </h3>

      {/* Phases */}
      <div className="mb-8 flex flex-wrap gap-2">
        {phases.map(phase => (
          <PhaseIndicator
            key={phase.name}
            phase={phase}
            isActive={phase.name === currentPhase}
          />
        ))}
      </div>

      {/* Timeline */}
      <div className="relative">
        <div
          className="absolute left-4 top-0 h-full w-0.5 bg-secondary-200 dark:bg-secondary-700"
          aria-hidden="true"
        ></div>

        <div className="space-y-6">
          {events.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative flex gap-4"
            >
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full ${getEventColor(
                  event.type,
                )}`}
              >
                {getEventIcon(event.type)}
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-secondary-900 dark:text-white">
                    {event.content}
                  </p>
                  <time className="text-xs text-secondary-500">
                    {formatDate(event.timestamp)}
                  </time>
                </div>
                {event.metadata && (
                  <p className="mt-1 text-sm text-secondary-600 dark:text-secondary-400">
                    {event.metadata}
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
} 