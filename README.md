# Debattle - Modern Political Debate Platform

A modern, fact-based political debate platform built with Next.js, TypeScript, and GraphQL.

## Project Structure

```
debattle/
├── frontend/          # Next.js frontend application
│   ├── src/          # Source code
│   ├── public/       # Static files
│   └── ...
├── backend/          # Backend application (coming soon)
└── README.md
```

## Frontend

The frontend is built with:
- Next.js 14
- TypeScript
- Tailwind CSS
- Framer Motion
- GraphQL (Apollo Client)
- NextAuth.js

### Getting Started

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file with the required environment variables:
```env
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-here
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
```

4. Start the development server:
```bash
npm run dev
```

## Features

- 🔐 Secure Authentication (Email, Google, GitHub)
- 📱 Responsive Design
- 🎨 Modern UI with Animations
- 🌙 Dark Mode Support
- 📊 Real-time Updates
- 🔍 Advanced Search
- 📝 Rich Text Editor
- 🔗 Source Verification
- 👥 User Profiles
- 🎯 Fact Checking
- 📈 Analytics Dashboard
- 🛡️ Moderation Tools

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting a pull request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Next.js team for the amazing framework
- Vercel for the deployment platform
- All contributors and supporters 