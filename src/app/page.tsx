import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { HeroSection } from '@/components/sections/hero'
import { FeaturedDebates } from '@/components/sections/featured-debates'
import { TrendingTopics } from '@/components/sections/trending-topics'
import { SearchInput } from '@/components/ui/input'

export default function HomePage() {
  return (
    <main className="min-h-screen space-y-16 pb-16">
      <HeroSection />
      
      <section className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto space-y-8">
          <h2 className="text-2xl font-bold text-center">
            Explore Debates
          </h2>
          <SearchInput />
        </div>
      </section>

      <section className="container mx-auto px-4">
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">
            Featured Debates
          </h2>
          <FeaturedDebates />
        </div>
      </section>

      <section className="bg-secondary/30 py-16">
        <div className="container mx-auto px-4">
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">
              Trending Topics
            </h2>
            <TrendingTopics />
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 text-center">
        <div className="max-w-2xl mx-auto space-y-6">
          <h2 className="text-2xl font-bold">
            Ready to Join the Conversation?
          </h2>
          <p className="text-muted-foreground">
            Engage in meaningful debates, share your perspective, and contribute to a more informed discourse.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/debates/new">
              <Button size="lg">Start a Debate</Button>
            </Link>
            <Link href="/debates">
              <Button variant="outline" size="lg">Browse Debates</Button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
} 