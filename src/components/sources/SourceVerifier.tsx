'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Alert } from '@/components/ui/alert'
import { Spinner } from '@/components/ui/spinner'
import { Badge } from '@/components/ui/badge'
import { Tooltip } from '@/components/ui/tooltip'
import { Icons } from '@/components/ui/icons'

const sourceSchema = z.object({
  url: z.string().url('Please enter a valid URL'),
  debateId: z.string().uuid().optional(),
  tags: z.array(z.string()).optional(),
})

type SourceInput = z.infer<typeof sourceSchema>

interface SourceVerifierProps {
  onVerified?: (result: any) => void
  debateId?: string
  className?: string
}

export function SourceVerifier({
  onVerified,
  debateId,
  className = '',
}: SourceVerifierProps) {
  const [isVerifying, setIsVerifying] = useState(false)
  const [verificationResult, setVerificationResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<SourceInput>({
    resolver: zodResolver(sourceSchema),
    defaultValues: {
      url: '',
      debateId,
      tags: [],
    },
  })

  const onSubmit = async (data: SourceInput) => {
    try {
      setIsVerifying(true)
      setError(null)

      const response = await fetch('/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            mutation VerifySource($input: VerifySourceInput!) {
              verifySource(input: $input) {
                isValid
                title
                description
                trustScore
                archiveUrl
                isDomainTrusted
                domain
                analysis {
                  category
                  topics
                  sentiment {
                    score
                    label
                  }
                  readabilityScore
                  credibilityIndicators {
                    hasReferences
                    hasDates
                    hasAuthor
                    hasStatistics
                    contentLength
                    languageQuality
                  }
                  biasIndicators {
                    emotionalLanguage
                    subjectivity
                    controversialTerms
                  }
                }
              }
            }
          `,
          variables: {
            input: data,
          },
        }),
      })

      const result = await response.json()

      if (result.errors) {
        throw new Error(result.errors[0].message)
      }

      setVerificationResult(result.data.verifySource)
      onVerified?.(result.data.verifySource)
      reset()
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to verify source')
    } finally {
      setIsVerifying(false)
    }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="flex gap-4">
          <Input
            {...register('url')}
            placeholder="Enter URL to verify"
            className="flex-1"
            disabled={isVerifying}
          />
          <Button type="submit" disabled={isVerifying}>
            {isVerifying ? <Spinner size="sm" /> : 'Verify'}
          </Button>
        </div>
        {errors.url && (
          <p className="text-sm text-red-500">{errors.url.message}</p>
        )}
      </form>

      {error && (
        <Alert variant="destructive">
          <Icons.alertCircle className="h-4 w-4" />
          <span>{error}</span>
        </Alert>
      )}

      <AnimatePresence mode="wait">
        {verificationResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <Card className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  Source Verification Result
                </h3>
                <Badge
                  variant={verificationResult.isValid ? 'success' : 'destructive'}
                >
                  {verificationResult.isValid ? 'Valid' : 'Invalid'}
                </Badge>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="mb-2 font-medium">Trust Score</h4>
                  <div className="flex items-center gap-4">
                    <Progress
                      value={verificationResult.trustScore * 100}
                      className="flex-1"
                    />
                    <span className="text-sm">
                      {Math.round(verificationResult.trustScore * 100)}%
                    </span>
                  </div>
                </div>

                <div>
                  <h4 className="mb-2 font-medium">Source Information</h4>
                  <div className="grid gap-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-secondary-500">Domain</span>
                      <Badge variant={verificationResult.isDomainTrusted ? 'success' : 'secondary'}>
                        {verificationResult.domain}
                      </Badge>
                    </div>
                    {verificationResult.title && (
                      <div className="flex items-center justify-between">
                        <span className="text-secondary-500">Title</span>
                        <span className="font-medium">{verificationResult.title}</span>
                      </div>
                    )}
                  </div>
                </div>

                {verificationResult.analysis && (
                  <>
                    <div>
                      <h4 className="mb-2 font-medium">Content Analysis</h4>
                      <div className="grid gap-2 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-secondary-500">Category</span>
                          <Badge>{verificationResult.analysis.category}</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-secondary-500">Topics</span>
                          <div className="flex gap-2">
                            {verificationResult.analysis.topics.map((topic: string) => (
                              <Badge key={topic} variant="outline">
                                {topic}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-secondary-500">Sentiment</span>
                          <Badge
                            variant={
                              verificationResult.analysis.sentiment.label === 'positive'
                                ? 'success'
                                : verificationResult.analysis.sentiment.label === 'negative'
                                ? 'destructive'
                                : 'secondary'
                            }
                          >
                            {verificationResult.analysis.sentiment.label}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="mb-2 font-medium">Credibility Indicators</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {Object.entries(verificationResult.analysis.credibilityIndicators)
                          .filter(([key]) => typeof key === 'boolean')
                          .map(([key, value]) => (
                            <Tooltip
                              key={key}
                              content={`This source ${value ? 'has' : 'does not have'} ${key.replace(/has/g, '').toLowerCase()}`}
                            >
                              <div className="flex items-center gap-2">
                                {value ? (
                                  <Icons.checkCircle className="h-4 w-4 text-green-500" />
                                ) : (
                                  <Icons.xCircle className="h-4 w-4 text-red-500" />
                                )}
                                <span className="text-sm">
                                  {key.replace(/has/g, '').replace(/([A-Z])/g, ' $1').trim()}
                                </span>
                              </div>
                            </Tooltip>
                          ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="mb-2 font-medium">Bias Analysis</h4>
                      <div className="space-y-2">
                        <div>
                          <div className="mb-1 flex items-center justify-between text-sm">
                            <span>Emotional Language</span>
                            <span>{Math.round(verificationResult.analysis.biasIndicators.emotionalLanguage * 100)}%</span>
                          </div>
                          <Progress
                            value={verificationResult.analysis.biasIndicators.emotionalLanguage * 100}
                            className="h-2"
                          />
                        </div>
                        <div>
                          <div className="mb-1 flex items-center justify-between text-sm">
                            <span>Subjectivity</span>
                            <span>{Math.round(verificationResult.analysis.biasIndicators.subjectivity * 100)}%</span>
                          </div>
                          <Progress
                            value={verificationResult.analysis.biasIndicators.subjectivity * 100}
                            className="h-2"
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {verificationResult.archiveUrl && (
                  <div className="mt-4">
                    <a
                      href={verificationResult.archiveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                    >
                      View Archived Version
                    </a>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
} 