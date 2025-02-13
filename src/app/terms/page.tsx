'use client'

import { motion } from 'framer-motion'

const sections = [
  {
    title: '1. Terms of Use',
    content: `By accessing and using Debattle, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.`,
  },
  {
    title: '2. User Accounts',
    content: `You must be 13 years or older to use this service. You are responsible for maintaining the security of your account and password. Debattle cannot and will not be liable for any loss or damage from your failure to comply with this security obligation.`,
  },
  {
    title: '3. Content Guidelines',
    content: `Users are expected to engage in respectful, fact-based discussions. Content must not be unlawful, offensive, threatening, defamatory, or infringe on intellectual property rights. We reserve the right to remove any content that violates these guidelines.`,
  },
  {
    title: '4. Privacy',
    content: `Your privacy is important to us. Please refer to our Privacy Policy for information on how we collect, use, and protect your personal data.`,
  },
  {
    title: '5. Intellectual Property',
    content: `The content on Debattle, including text, graphics, logos, and software, is the property of Debattle and protected by intellectual property laws. Users retain ownership of their content but grant Debattle a license to use, display, and distribute it.`,
  },
  {
    title: '6. Limitation of Liability',
    content: `Debattle is provided "as is" without warranties of any kind. We are not liable for any damages arising from your use of our service.`,
  },
  {
    title: '7. Modifications',
    content: `We reserve the right to modify these terms at any time. We will notify users of any material changes via email or through the platform.`,
  },
  {
    title: '8. Termination',
    content: `We may terminate or suspend your account at any time for violations of these terms or for any other reason we deem necessary to protect our platform and community.`,
  },
]

export default function TermsPage() {
  return (
    <div className="bg-white dark:bg-secondary-900">
      <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
        <motion.div
          className="mx-auto max-w-2xl text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold tracking-tight text-secondary-900 dark:text-white sm:text-6xl">
            Terms of Service
          </h1>
          <p className="mt-6 text-lg leading-8 text-secondary-600 dark:text-secondary-400">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </motion.div>

        <div className="mx-auto mt-16 max-w-3xl">
          {sections.map((section, index) => (
            <motion.div
              key={section.title}
              className="mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <h2 className="text-2xl font-bold tracking-tight text-secondary-900 dark:text-white">
                {section.title}
              </h2>
              <p className="mt-4 text-base leading-7 text-secondary-600 dark:text-secondary-400">
                {section.content}
              </p>
            </motion.div>
          ))}

          <motion.div
            className="mt-16 border-t border-secondary-200 pt-8 dark:border-secondary-800"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <p className="text-sm text-secondary-500 dark:text-secondary-400">
              For any questions about these terms, please contact us at{' '}
              <a
                href="mailto:legal@debattle.com"
                className="text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
              >
                legal@debattle.com
              </a>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  )
} 