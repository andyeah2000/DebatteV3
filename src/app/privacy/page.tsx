'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

const sections = [
  {
    title: '1. Information We Collect',
    content: [
      {
        subtitle: 'Personal Information',
        text: 'We collect information that you provide directly to us, including name, email address, and profile information.',
      },
      {
        subtitle: 'Usage Data',
        text: 'We automatically collect certain information about your device and how you interact with our platform.',
      },
      {
        subtitle: 'Debate Content',
        text: 'We collect and store the content you create, including debates, comments, and votes.',
      },
    ],
  },
  {
    title: '2. How We Use Your Information',
    content: [
      {
        subtitle: 'Platform Operation',
        text: 'To operate, maintain, and improve our platform features and services.',
      },
      {
        subtitle: 'Communication',
        text: 'To communicate with you about updates, security alerts, and support messages.',
      },
      {
        subtitle: 'Analytics',
        text: 'To analyze usage patterns and improve user experience.',
      },
    ],
  },
  {
    title: '3. Information Sharing',
    content: [
      {
        subtitle: 'Public Content',
        text: 'Debates and comments are public by default and can be viewed by other users.',
      },
      {
        subtitle: 'Service Providers',
        text: 'We may share information with third-party service providers who assist in platform operations.',
      },
      {
        subtitle: 'Legal Requirements',
        text: 'We may disclose information if required by law or to protect rights and safety.',
      },
    ],
  },
  {
    title: '4. Data Security',
    content: [
      {
        subtitle: 'Protection Measures',
        text: 'We implement appropriate technical and organizational measures to protect your data.',
      },
      {
        subtitle: 'Data Retention',
        text: 'We retain personal information for as long as necessary to provide our services.',
      },
    ],
  },
  {
    title: '5. Your Rights',
    content: [
      {
        subtitle: 'Access and Control',
        text: 'You can access, update, or delete your personal information through your account settings.',
      },
      {
        subtitle: 'Data Portability',
        text: 'You can request a copy of your data in a structured, commonly used format.',
      },
    ],
  },
  {
    title: '6. Cookies and Tracking',
    content: [
      {
        subtitle: 'Cookie Usage',
        text: 'We use cookies and similar technologies to enhance your experience and collect usage data.',
      },
      {
        subtitle: 'Tracking Options',
        text: 'You can control cookie preferences through your browser settings.',
      },
    ],
  },
]

export default function PrivacyPage() {
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
            Privacy Policy
          </h1>
          <p className="mt-6 text-lg leading-8 text-secondary-600 dark:text-secondary-400">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </motion.div>

        <div className="mx-auto mt-16 max-w-3xl">
          <motion.p
            className="text-base leading-7 text-secondary-600 dark:text-secondary-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            This Privacy Policy describes how Debattle ("we," "our," or "us") collects, uses, and
            shares your personal information when you use our platform. By using Debattle, you agree
            to the collection and use of information in accordance with this policy.
          </motion.p>

          {sections.map((section, index) => (
            <motion.div
              key={section.title}
              className="mt-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <h2 className="text-2xl font-bold tracking-tight text-secondary-900 dark:text-white">
                {section.title}
              </h2>
              <div className="mt-6 space-y-6">
                {section.content.map((item) => (
                  <div key={item.subtitle}>
                    <h3 className="text-lg font-semibold text-secondary-900 dark:text-white">
                      {item.subtitle}
                    </h3>
                    <p className="mt-2 text-base leading-7 text-secondary-600 dark:text-secondary-400">
                      {item.text}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}

          <motion.div
            className="mt-16 border-t border-secondary-200 pt-8 dark:border-secondary-800"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <p className="text-base text-secondary-600 dark:text-secondary-400">
              If you have any questions about this Privacy Policy, please contact us at{' '}
              <a
                href="mailto:privacy@debattle.com"
                className="text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
              >
                privacy@debattle.com
              </a>
              .
            </p>
            <p className="mt-4 text-sm text-secondary-500 dark:text-secondary-400">
              For more information about your rights and our practices, please review our{' '}
              <Link
                href="/terms"
                className="text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
              >
                Terms of Service
              </Link>
              .
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  )
} 