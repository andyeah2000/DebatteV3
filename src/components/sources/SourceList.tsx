'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Tooltip } from '@/components/ui/tooltip'
import { Icons } from '@/components/ui/icons'
import { ScrollArea } from '@/components/ui/scroll-area'

interface Source {
  id: string
  url: string
  title: string
  description: string
  trustScore: number
  domain: string
  isDomainTrusted: boolean
  archiveUrl: string | null
  analysis: {
    category: string
    topics: string[]
    sentiment: {
      score: number
      label: string
    }
    readabilityScore: number
    credibilityIndicators: {
      hasReferences: boolean
      hasDates: boolean
      hasAuthor: boolean
      hasStatistics: boolean
      contentLength: number
      languageQuality: number
    }
    biasIndicators: {
      emotionalLanguage: number
      subjectivity: number
      controversialTerms: string[]
    }
  }
  createdAt: string
  updatedAt: string
}

interface SourceListProps {
  sources: Source[]
  onRemove?: (sourceId: string) => void
  onEdit?: (source: Source) => void
  className?: string
  maxHeight?: string | number
}

export function SourceList({
  sources,
  onRemove,
  onEdit,
  className = '',
  maxHeight = '600px',
}: SourceListProps) {
  const [expandedSourceId, setExpandedSourceId] = useState<string | null>(null)

  const toggleExpand = (sourceId: string) => {
    setExpandedSourceId(expandedSourceId === sourceId ? null : sourceId)
  }

  return (
    <ScrollArea className={className} style={{ maxHeight }}>
      <div className="space-y-4 p-1">
        <AnimatePresence initial={false}>
          {sources.map((source) => (
            <motion.div
              key={source.id}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="overflow-hidden">
                <div
                  className="cursor-pointer p-4"
                  onClick={() => toggleExpand(source.id)}
                >
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{source.title || source.url}</h3>
                      <Badge
                        variant={source.isDomainTrusted ? 'success' : 'secondary'}
                      >
                        {source.domain}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      {onEdit && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            onEdit(source)
                          }}
                        >
                          <Icons.edit className="h-4 w-4" />
                        </Button>
                      )}
                      {onRemove && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            onRemove(source.id)
                          }}
                        >
                          <Icons.trash className="h-4 w-4" />
                        </Button>
                      )}
                      <Icons.chevronDown
                        className={`h-4 w-4 transform transition-transform ${
                          expandedSourceId === source.id ? 'rotate-180' : ''
                        }`}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="mb-1 flex items-center justify-between text-sm">
                        <span>Trust Score</span>
                        <span>{Math.round(source.trustScore * 100)}%</span>
                      </div>
                      <Progress value={source.trustScore * 100} className="h-2" />
                    </div>
                    <Badge
                      variant={
                        source.analysis.sentiment.label === 'positive'
                          ? 'success'
                          : source.analysis.sentiment.label === 'negative'
                          ? 'destructive'
                          : 'secondary'
                      }
                    >
                      {source.analysis.sentiment.label}
                    </Badge>
                  </div>
                </div>

                <AnimatePresence>
                  {expandedSourceId === source.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="border-t px-4 py-3">
                        <div className="space-y-4">
                          {source.description && (
                            <div>
                              <h4 className="mb-1 text-sm font-medium">
                                Description
                              </h4>
                              <p className="text-sm text-secondary-500">
                                {source.description}
                              </p>
                            </div>
                          )}

                          <div>
                            <h4 className="mb-2 text-sm font-medium">
                              Content Analysis
                            </h4>
                            <div className="grid gap-2">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-secondary-500">Category</span>
                                <Badge>{source.analysis.category}</Badge>
                              </div>
                              <div>
                                <span className="text-sm text-secondary-500">
                                  Topics
                                </span>
                                <div className="mt-1 flex flex-wrap gap-1">
                                  {source.analysis.topics.map((topic) => (
                                    <Badge key={topic} variant="outline">
                                      {topic}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>

                          <div>
                            <h4 className="mb-2 text-sm font-medium">
                              Credibility Indicators
                            </h4>
                            <div className="grid grid-cols-2 gap-2">
                              {Object.entries(
                                source.analysis.credibilityIndicators
                              )
                                .filter(([key]) => typeof key === 'boolean')
                                .map(([key, value]) => (
                                  <Tooltip
                                    key={key}
                                    content={`This source ${
                                      value ? 'has' : 'does not have'
                                    } ${key
                                      .replace(/has/g, '')
                                      .toLowerCase()}`}
                                  >
                                    <div className="flex items-center gap-2">
                                      {value ? (
                                        <Icons.checkCircle className="h-4 w-4 text-green-500" />
                                      ) : (
                                        <Icons.xCircle className="h-4 w-4 text-red-500" />
                                      )}
                                      <span className="text-sm">
                                        {key
                                          .replace(/has/g, '')
                                          .replace(/([A-Z])/g, ' $1')
                                          .trim()}
                                      </span>
                                    </div>
                                  </Tooltip>
                                ))}
                            </div>
                          </div>

                          <div>
                            <h4 className="mb-2 text-sm font-medium">
                              Bias Analysis
                            </h4>
                            <div className="space-y-2">
                              <div>
                                <div className="mb-1 flex items-center justify-between text-sm">
                                  <span>Emotional Language</span>
                                  <span>
                                    {Math.round(
                                      source.analysis.biasIndicators
                                        .emotionalLanguage * 100
                                    )}
                                    %
                                  </span>
                                </div>
                                <Progress
                                  value={
                                    source.analysis.biasIndicators
                                      .emotionalLanguage * 100
                                  }
                                  className="h-2"
                                />
                              </div>
                              <div>
                                <div className="mb-1 flex items-center justify-between text-sm">
                                  <span>Subjectivity</span>
                                  <span>
                                    {Math.round(
                                      source.analysis.biasIndicators.subjectivity *
                                        100
                                    )}
                                    %
                                  </span>
                                </div>
                                <Progress
                                  value={
                                    source.analysis.biasIndicators.subjectivity *
                                    100
                                  }
                                  className="h-2"
                                />
                              </div>
                              {source.analysis.biasIndicators.controversialTerms
                                .length > 0 && (
                                <div>
                                  <span className="text-sm text-secondary-500">
                                    Controversial Terms
                                  </span>
                                  <div className="mt-1 flex flex-wrap gap-1">
                                    {source.analysis.biasIndicators.controversialTerms.map(
                                      (term) => (
                                        <Badge
                                          key={term}
                                          variant="outline"
                                          className="text-red-500"
                                        >
                                          {term}
                                        </Badge>
                                      )
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          {source.archiveUrl && (
                            <div>
                              <a
                                href={source.archiveUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                              >
                                View Archived Version
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ScrollArea>
  )
} 