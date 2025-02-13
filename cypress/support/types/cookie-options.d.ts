/**
 * Interface for cookie options used in Cypress commands
 */
export interface CookieOptions {
  /** The path where the cookie is valid */
  path: string;
  /** Optional domain where the cookie is visible */
  domain?: string;
  /** Indicates if this is a secure cookie */
  secure?: boolean;
  /** Indicates if the cookie is only accessible via HTTP */
  httpOnly?: boolean;
  /** Expiration date of the cookie (in seconds since Unix epoch) */
  expiry?: number;
  /** SameSite attribute: 'lax', 'strict' or 'no_restriction' */
  sameSite?: 'lax' | 'strict' | 'no_restriction';
} 