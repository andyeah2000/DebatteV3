import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { HeroSection } from '@/components/sections/hero'
import { FeaturedDebates } from '@/components/sections/featured-debates'
import { TrendingTopics } from '@/components/sections/trending-topics'

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <HeroSection />
      
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-8">
          Featured Debates
        </h2>
        <FeaturedDebates />
      </section>

      <section className="bg-secondary-50 dark:bg-secondary-900">
        <div className="container mx-auto px-4 py-16">
          <h2 className="text-3xl font-bold text-center mb-8">
            Trending Topics
          </h2>
          <TrendingTopics />
        </div>
      </section>

      <section className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-3xl font-bold mb-4">
          Ready to Join the Conversation?
        </h2>
        <p className="text-secondary-600 dark:text-secondary-400 mb-8 max-w-2xl mx-auto">
          Engage in meaningful debates, share your perspective, and contribute to a more informed discourse.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/debates/new">
            <Button asChild>Start a Debate</Button>
          </Link>
          <Link href="/debates">
            <Button asChild variant="outline">Browse Debates</Button>
          </Link>
        </div>
      </section>
    </main>
  )
} 