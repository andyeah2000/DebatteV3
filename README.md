# Debattle - Modern Political Debate Platform

A fact-based platform for meaningful political debates and discussions. Built with Next.js, TypeScript, and modern web technologies.

## Features

- 🎯 Fact-based political debates
- 🌓 Dark/Light mode
- 🎨 Modern, minimalist design
- ⚡ Real-time updates
- 📱 Fully responsive
- 🔒 Secure authentication
- 🎭 Role-based access control
- 📊 Debate analytics

## Tech Stack

- **Frontend:**
  - Next.js 14
  - React 18
  - TypeScript
  - Tailwind CSS
  - Framer Motion
  - Apollo Client

- **Backend:**
  - Node.js
  - NestJS
  - GraphQL
  - PostgreSQL
  - Redis
  - Socket.IO

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Git

### Installation

1. Clone the repository:
\`\`\`bash
git clone https://github.com/yourusername/debattle.git
cd debattle
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
# or
yarn install
\`\`\`

3. Create a \`.env.local\` file in the root directory:
\`\`\`env
NEXT_PUBLIC_GRAPHQL_URL=http://localhost:4000/graphql
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key
\`\`\`

4. Start the development server:
\`\`\`bash
npm run dev
# or
yarn dev
\`\`\`

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run test` - Run tests

## Project Structure

\`\`\`
src/
├── app/              # Next.js app directory
├── components/       # React components
│   ├── ui/          # Reusable UI components
│   └── sections/    # Page sections
├── lib/             # Utilities and configurations
├── styles/          # Global styles
└── types/           # TypeScript type definitions
\`\`\`

## Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Next.js team for the amazing framework
- Vercel for the deployment platform
- All contributors and supporters 