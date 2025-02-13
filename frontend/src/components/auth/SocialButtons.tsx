'use client'

import { signIn } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Icons } from '@/components/ui/icons'

interface SocialButtonsProps {
  isLoading?: boolean
}

export default function SocialButtons({ isLoading }: SocialButtonsProps) {
  return (
    <div className="grid gap-3">
      <Button
        variant="outline"
        type="button"
        disabled={isLoading}
        className="bg-background hover:bg-accent hover:text-accent-foreground"
        onClick={() => signIn('google', { callbackUrl: '/' })}
      >
        {isLoading ? (
          <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Icons.google className="mr-2 h-4 w-4" />
        )}
        Continue with Google
      </Button>
      <Button
        variant="outline"
        type="button"
        disabled={isLoading}
        className="bg-background hover:bg-accent hover:text-accent-foreground"
        onClick={() => signIn('github', { callbackUrl: '/' })}
      >
        {isLoading ? (
          <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Icons.gitHub className="mr-2 h-4 w-4" />
        )}
        Continue with GitHub
      </Button>
    </div>
  )
} 