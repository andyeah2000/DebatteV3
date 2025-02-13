import { motion } from 'framer-motion'
import { Comment, Source, Media } from '@/types/debate'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/utils'

interface ArgumentsSectionProps {
  proComments: Comment[]
  conComments: Comment[]
  onVote: (isProVote: boolean) => void | Promise<void>
  onReply: (commentId: string) => void
  isLoggedIn: boolean
}

function ArgumentCard({ comment }: { comment: Comment }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-4 rounded-lg bg-white p-6 shadow-sm dark:bg-secondary-800"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center">
          {comment.author.avatarUrl && (
            <img
              src={comment.author.avatarUrl}
              alt={comment.author.username}
              className="mr-4 h-10 w-10 rounded-full"
            />
          )}
          <div>
            <p className="font-medium text-secondary-900 dark:text-white">
              {comment.author.username}
            </p>
            <p className="text-sm text-secondary-500">
              {formatDate(comment.createdAt)}
            </p>
          </div>
        </div>
        {comment.isVerified && (
          <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800 dark:bg-green-900/20 dark:text-green-400">
            Verified
          </span>
        )}
      </div>

      <div className="mt-4">
        <p className="text-secondary-700 dark:text-secondary-300">{comment.content}</p>

        {/* Sources Section */}
        {comment.sources.length > 0 && (
          <div className="mt-4">
            <h4 className="mb-2 text-sm font-medium text-secondary-900 dark:text-white">Sources:</h4>
            <ul className="space-y-2">
              {comment.sources.map((source: Source) => (
                <li
                  key={source.url}
                  className="flex items-center justify-between rounded-md bg-secondary-50 p-2 dark:bg-secondary-800/50"
                >
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400"
                  >
                    {source.title}
                  </a>
                  <span
                    className={`ml-2 rounded-full px-2 py-1 text-xs font-medium ${
                      source.verificationStatus === 'verified'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                        : source.verificationStatus === 'rejected'
                        ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                    }`}
                  >
                    {source.verificationStatus}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Media Section */}
        {comment.media.length > 0 && (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {comment.media.map((media: Media) => (
              <div
                key={media.url}
                className="overflow-hidden rounded-lg border border-secondary-200 dark:border-secondary-700"
              >
                {media.type === 'image' && (
                  <img
                    src={media.url}
                    alt={media.title}
                    className="h-48 w-full object-cover"
                  />
                )}
                {media.type === 'video' && (
                  <video
                    src={media.url}
                    controls
                    className="h-48 w-full object-cover"
                  />
                )}
                {media.type === 'infographic' && (
                  <img
                    src={media.url}
                    alt={media.title}
                    className="h-48 w-full object-contain"
                  />
                )}
                <div className="p-2">
                  <h5 className="text-sm font-medium text-secondary-900 dark:text-white">
                    {media.title}
                  </h5>
                  {media.description && (
                    <p className="mt-1 text-xs text-secondary-500">
                      {media.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* AI Analysis Section */}
        <div className="mt-4 rounded-md bg-secondary-50 p-4 dark:bg-secondary-800/50">
          <div className="grid gap-2 sm:grid-cols-2">
            <div>
              <p className="text-xs font-medium text-secondary-500">Argument Quality</p>
              <div className="mt-1 flex items-center">
                <div className="h-2 w-full rounded-full bg-secondary-200 dark:bg-secondary-700">
                  <div
                    className="h-2 rounded-full bg-primary-500"
                    style={{
                      width: `${comment.metadata.aiAnalysis.argumentQuality}%`,
                    }}
                  />
                </div>
                <span className="ml-2 text-sm font-medium text-secondary-700 dark:text-secondary-300">
                  {comment.metadata.aiAnalysis.argumentQuality}%
                </span>
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-secondary-500">Factual Accuracy</p>
              <div className="mt-1 flex items-center">
                <div className="h-2 w-full rounded-full bg-secondary-200 dark:bg-secondary-700">
                  <div
                    className="h-2 rounded-full bg-primary-500"
                    style={{
                      width: `${comment.metadata.aiAnalysis.factualAccuracy || 0}%`,
                    }}
                  />
                </div>
                <span className="ml-2 text-sm font-medium text-secondary-700 dark:text-secondary-300">
                  {comment.metadata.aiAnalysis.factualAccuracy || 0}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Voting Section */}
        <div className="mt-4 flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-green-600 hover:text-green-700 dark:text-green-400"
            >
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
              <span className="ml-1">{comment.upvotes}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-red-600 hover:text-red-700 dark:text-red-400"
            >
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
                  d="M19 9l-7 7-7-7"
                />
              </svg>
              <span className="ml-1">{comment.downvotes}</span>
            </Button>
          </div>
          <Button variant="ghost" size="sm">
            Reply
          </Button>
        </div>
      </div>
    </motion.div>
  )
}

export function ArgumentsSection({
  proComments,
  conComments,
  onVote,
  onReply,
  isLoggedIn,
}: ArgumentsSectionProps) {
  return (
    <div className="grid gap-8 md:grid-cols-2">
      {/* Pro Arguments */}
      <div>
        <h2 className="mb-6 text-xl font-bold text-green-600 dark:text-green-400">
          Pro Arguments
        </h2>
        <div className="space-y-4">
          {proComments.map(comment => (
            <ArgumentCard key={comment.id} comment={comment} />
          ))}
        </div>
      </div>

      {/* Con Arguments */}
      <div>
        <h2 className="mb-6 text-xl font-bold text-red-600 dark:text-red-400">
          Con Arguments
        </h2>
        <div className="space-y-4">
          {conComments.map(comment => (
            <ArgumentCard key={comment.id} comment={comment} />
          ))}
        </div>
      </div>
    </div>
  )
} 