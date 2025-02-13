'use client'

import { useState } from 'react'
import { useQuery, useMutation } from '@apollo/client'
import { gql } from '@apollo/client'
import { SourceVerifier } from './SourceVerifier'
import { SourceList } from './SourceList'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert } from '@/components/ui/alert'
import { Icons } from '@/components/ui/icons'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

const GET_SOURCES = gql`
  query GetSources($debateId: ID) {
    sources(debateId: $debateId) {
      id
      url
      title
      description
      trustScore
      domain
      isDomainTrusted
      archiveUrl
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
      createdAt
      updatedAt
    }
  }
`

const REMOVE_SOURCE = gql`
  mutation RemoveSource($id: ID!) {
    removeSource(id: $id)
  }
`

interface SourceManagerProps {
  debateId?: string
  className?: string
}

export function SourceManager({ debateId, className = '' }: SourceManagerProps) {
  const [activeTab, setActiveTab] = useState('list')
  const [error, setError] = useState<string | null>(null)

  const { data, loading, refetch } = useQuery(GET_SOURCES, {
    variables: { debateId },
    fetchPolicy: 'cache-and-network',
  })

  const [removeSource] = useMutation(REMOVE_SOURCE, {
    onCompleted: () => {
      refetch()
    },
    onError: (error) => {
      setError(error.message)
    },
  })

  const handleSourceVerified = () => {
    refetch()
    setActiveTab('list')
  }

  const handleRemoveSource = async (sourceId: string) => {
    try {
      await removeSource({
        variables: { id: sourceId },
      })
    } catch (error) {
      // Error is handled by onError in mutation options
    }
  }

  return (
    <div className={className}>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="mb-4 flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="list" disabled={loading}>
              Sources
            </TabsTrigger>
            <TabsTrigger value="add" disabled={loading}>
              Add Source
            </TabsTrigger>
          </TabsList>
          {loading && <Icons.spinner className="h-4 w-4 animate-spin" />}
        </div>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <Icons.alertCircle className="h-4 w-4" />
            <span>{error}</span>
          </Alert>
        )}

        <TabsContent value="list" className="mt-0">
          {data?.sources && data.sources.length > 0 ? (
            <SourceList
              sources={data.sources}
              onRemove={handleRemoveSource}
              maxHeight="calc(100vh - 200px)"
            />
          ) : (
            <Card className="flex flex-col items-center justify-center p-6">
              <Icons.fileX className="mb-2 h-8 w-8 text-secondary-400" />
              <p className="mb-4 text-center text-secondary-600">
                No sources added yet
              </p>
              <Button onClick={() => setActiveTab('add')}>Add Source</Button>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="add" className="mt-0">
          <Card className="p-6">
            <SourceVerifier
              debateId={debateId}
              onVerified={handleSourceVerified}
            />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 