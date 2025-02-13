'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import type { Route } from 'next'

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
}

const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.2
    }
  }
}

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-background to-secondary/20">
      {/* Background Elements */}
      <div className="absolute inset-0 z-0">
        <motion.div
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          {/* Gradient Orbs */}
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
          
          {/* Grid Pattern */}
          <div className="absolute inset-0 bg-grid-white/10 bg-[length:30px_30px] [mask-image:linear-gradient(to_bottom,transparent,80%,white)]" />
        </motion.div>
      </div>

      <div className="container relative z-10 mx-auto px-4 py-32 sm:px-6 lg:px-8">
        <motion.div
          className="mx-auto max-w-3xl text-center"
          variants={stagger}
          initial="initial"
          animate="animate"
        >
          <motion.div
            variants={fadeInUp}
            className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-8"
          >
            Welcome to Debattle
          </motion.div>
          
          <motion.h1
            variants={fadeInUp}
            className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl"
          >
            Elevate Political Discourse Through{' '}
            <span className="text-primary">
              Fact-Based Debate
            </span>
          </motion.h1>

          <motion.p
            variants={fadeInUp}
            className="mt-6 text-lg leading-8 text-muted-foreground"
          >
            Join a community dedicated to meaningful political discussions.
            Share your perspective, challenge ideas, and contribute to a more
            informed society.
          </motion.p>

          <motion.div
            variants={fadeInUp}
            className="mt-10 flex items-center justify-center gap-x-6"
          >
            <Link href={'/debates/new' as Route}>
              <Button size="lg" className="shadow-lg hover:shadow-primary/25">
                Start a Debate
              </Button>
            </Link>
            <Link href={'/about' as Route}>
              <Button variant="outline" size="lg">
                Learn More
              </Button>
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            variants={fadeInUp}
            className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-3"
          >
            {[
              { label: 'Active Debates', value: '2.5K+' },
              { label: 'Community Members', value: '10K+' },
              { label: 'Sources Verified', value: '50K+' },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col items-center">
                <dt className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </dt>
                <dd className="text-3xl font-bold tracking-tight text-foreground">
                  {stat.value}
                </dd>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
} 