import { UserProfileSkeleton } from '@/components/ui/skeleton'

export default function UserProfileLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <UserProfileSkeleton />
    </div>
  )
} 