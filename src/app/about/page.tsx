'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

const features = [
  {
    name: 'Fact-Based Debates',
    description: 'Engage in meaningful discussions backed by verified sources and expert knowledge.',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    name: 'Real-Time Interaction',
    description: 'Experience live updates as debates unfold, with instant notifications for new arguments and votes.',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    name: 'Reputation System',
    description: 'Build credibility through constructive contributions and verified sources.',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
      </svg>
    ),
  },
  {
    name: 'Structured Arguments',
    description: 'Present your points clearly with our organized debate format and source citation system.',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
      </svg>
    ),
  },
]

const team = [
  {
    name: 'Sarah Johnson',
    role: 'Founder & CEO',
    bio: 'Former debate champion with a passion for fostering meaningful political discourse.',
    image: 'https://ui-avatars.com/api/?name=Sarah+Johnson',
  },
  {
    name: 'Michael Chen',
    role: 'CTO',
    bio: 'Tech veteran focused on building scalable and secure platforms for public discourse.',
    image: 'https://ui-avatars.com/api/?name=Michael+Chen',
  },
  {
    name: 'Dr. Emily Rodriguez',
    role: 'Head of Research',
    bio: 'Political science professor specializing in digital democracy and online discourse.',
    image: 'https://ui-avatars.com/api/?name=Emily+Rodriguez',
  },
]

export default function AboutPage() {
  return (
    <div className="bg-white dark:bg-secondary-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <motion.div
            className="mx-auto max-w-2xl text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl font-bold tracking-tight text-secondary-900 dark:text-white sm:text-6xl">
              Elevating Political Discourse
            </h1>
            <p className="mt-6 text-lg leading-8 text-secondary-600 dark:text-secondary-400">
              Debattle is a platform dedicated to fostering meaningful political debates through
              fact-based discussions, civil discourse, and mutual understanding.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link href="/debates">
                <Button asChild>Explore Debates</Button>
              </Link>
              <Link href="/register">
                <Button asChild variant="outline">Join Us</Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Mission Section */}
      <div className="bg-secondary-50 py-24 dark:bg-secondary-800 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <motion.div
            className="mx-auto max-w-2xl text-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold tracking-tight text-secondary-900 dark:text-white sm:text-4xl">
              Our Mission
            </h2>
            <p className="mt-6 text-lg leading-8 text-secondary-600 dark:text-secondary-400">
              We believe that healthy democracy requires informed and respectful debate.
              Our platform provides the tools and structure needed for constructive political
              discourse, helping bridge divides and foster understanding across different viewpoints.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-secondary-900 dark:text-white sm:text-4xl">
              Platform Features
            </h2>
            <p className="mt-6 text-lg leading-8 text-secondary-600 dark:text-secondary-400">
              Everything you need to engage in meaningful political discourse
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-7xl sm:mt-20 lg:mt-24">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-2">
              {features.map((feature) => (
                <motion.div
                  key={feature.name}
                  className="relative pl-16"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                >
                  <dt className="text-base font-semibold leading-7 text-secondary-900 dark:text-white">
                    <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-primary-600">
                      <div className="text-white">{feature.icon}</div>
                    </div>
                    {feature.name}
                  </dt>
                  <dd className="mt-2 text-base leading-7 text-secondary-600 dark:text-secondary-400">
                    {feature.description}
                  </dd>
                </motion.div>
              ))}
            </dl>
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="bg-secondary-50 py-24 dark:bg-secondary-800 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-secondary-900 dark:text-white sm:text-4xl">
              Meet Our Team
            </h2>
            <p className="mt-6 text-lg leading-8 text-secondary-600 dark:text-secondary-400">
              Dedicated professionals committed to improving political discourse
            </p>
          </div>
          <ul
            role="list"
            className="mx-auto mt-20 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:grid-cols-2 lg:mx-0 lg:max-w-none lg:grid-cols-3"
          >
            {team.map((person) => (
              <motion.li
                key={person.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <img
                  className="aspect-[3/2] w-full rounded-2xl object-cover"
                  src={person.image}
                  alt={person.name}
                />
                <h3 className="mt-6 text-lg font-semibold leading-8 text-secondary-900 dark:text-white">
                  {person.name}
                </h3>
                <p className="text-base leading-7 text-primary-600 dark:text-primary-400">
                  {person.role}
                </p>
                <p className="mt-4 text-base leading-7 text-secondary-600 dark:text-secondary-400">
                  {person.bio}
                </p>
              </motion.li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
} 