import { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Get debates from your API
  const debates = await fetch('http://localhost:4000/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: `
        query GetDebates {
          debates(input: { page: 1, limit: 1000, sortBy: "recent" }) {
            id
            updatedAt
          }
        }
      `,
    }),
  }).then((res) => res.json())

  // Get users from your API
  const users = await fetch('http://localhost:4000/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: `
        query GetUsers {
          users {
            id
            updatedAt
          }
        }
      `,
    }),
  }).then((res) => res.json())

  // Static routes
  const routes = [
    {
      url: 'https://debattle.com',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: 'https://debattle.com/debates',
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.9,
    },
    {
      url: 'https://debattle.com/about',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: 'https://debattle.com/terms',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: 'https://debattle.com/privacy',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
  ] as const

  // Dynamic routes for debates
  const debateRoutes = debates.data.debates.map((debate: any) => ({
    url: `https://debattle.com/debates/${debate.id}`,
    lastModified: new Date(debate.updatedAt),
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }))

  // Dynamic routes for users
  const userRoutes = users.data.users.map((user: any) => ({
    url: `https://debattle.com/users/${user.id}`,
    lastModified: new Date(user.updatedAt),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }))

  return [...routes, ...debateRoutes, ...userRoutes]
} 