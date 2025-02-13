import type { Metadata } from 'next'

const defaultMetadata = {
  title: 'Debattle - Modern Political Debate Platform',
  description: 'A fact-based platform for meaningful political debates and discussions.',
  keywords: [
    'debate',
    'politics',
    'discussion',
    'facts',
    'arguments',
    'political discourse',
    'democracy',
  ],
  authors: [{ name: 'Debattle Team' }],
  creator: 'Debattle Team',
  publisher: 'Debattle',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://debattle.com',
    siteName: 'Debattle',
    title: 'Debattle - Modern Political Debate Platform',
    description: 'A fact-based platform for meaningful political debates and discussions.',
    images: [
      {
        url: 'https://debattle.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Debattle - Modern Political Debate Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@debattle',
    creator: '@debattle',
    title: 'Debattle - Modern Political Debate Platform',
    description: 'A fact-based platform for meaningful political debates and discussions.',
    images: ['https://debattle.com/twitter-image.png'],
  },
}

export function generateMetadata({
  title,
  description,
  path = '',
  noIndex = false,
}: {
  title?: string
  description?: string
  path?: string
  noIndex?: boolean
}): Metadata {
  const fullTitle = title ? `${title} | Debattle` : defaultMetadata.title
  const fullDescription = description || defaultMetadata.description
  const url = `https://debattle.com${path}`

  return {
    ...defaultMetadata,
    title: fullTitle,
    description: fullDescription,
    robots: noIndex ? 'noindex, nofollow' : defaultMetadata.robots,
    alternates: {
      canonical: url,
    },
    openGraph: {
      ...defaultMetadata.openGraph,
      title: fullTitle,
      description: fullDescription,
      url,
    },
    twitter: {
      ...defaultMetadata.twitter,
      title: fullTitle,
      description: fullDescription,
    },
  }
}

export function generateDebateMetadata(debate: {
  title: string
  description: string
  author: { username: string }
  createdAt: string
  id: string
}): Metadata {
  const title = debate.title
  const description = debate.description
  const path = `/debates/${debate.id}`

  return generateMetadata({
    title,
    description,
    path,
    noIndex: false,
  })
}

export function generateUserMetadata(user: {
  username: string
  bio?: string
  id: string
}): Metadata {
  const title = `${user.username}'s Profile`
  const description = user.bio || `Check out ${user.username}'s debates and contributions on Debattle.`
  const path = `/users/${user.id}`

  return generateMetadata({
    title,
    description,
    path,
    noIndex: false,
  })
} 