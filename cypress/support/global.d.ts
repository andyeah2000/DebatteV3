/// <reference types="cypress" />
import { CookieOptions } from './types/cookie-options'

declare global {
  namespace Cypress {
    interface Chainable<Subject = any> {
      login(email: string, password: string): Chainable<void>
      logout(): Chainable<void>
      createDebate(title: string, description: string): Chainable<void>
      vote(debateId: string, isProVote: boolean): Chainable<void>
      addComment(debateId: string, content: string): Chainable<void>
      persistSession(): Chainable<void>
      cleanup(): Chainable<void>
      setupTest(): Chainable<void>
      cleanupTest(): Chainable<void>
    }

    interface Cookie {
      name: string
      value: string
      path: string
      domain: string
      secure: boolean
      httpOnly: boolean
      expiry?: number
      sameSite?: 'lax' | 'strict' | 'no_restriction'
    }

    interface SetCookieOptions extends CookieOptions {}
  }

  interface Window {
    indexedDB: IDBFactory & {
      databases?(): Promise<IDBDatabaseInfo[]>
    }
  }
}

export {} 