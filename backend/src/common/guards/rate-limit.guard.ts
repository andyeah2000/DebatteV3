import { Injectable, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common'
import { GqlExecutionContext } from '@nestjs/graphql'
import { ThrottlerGuard } from '@nestjs/throttler'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Cache } from 'cache-manager'
import { Inject } from '@nestjs/common'

@Injectable()
export class GqlThrottlerGuard extends ThrottlerGuard {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {
    super()
  }

  getRequestResponse(context: ExecutionContext) {
    const gqlCtx = GqlExecutionContext.create(context)
    const ctx = gqlCtx.getContext()
    return { req: ctx.req, res: ctx.res }
  }

  async getTracker(req: Record<string, any>): Promise<string> {
    // Get client IP
    const ip = req.ips.length ? req.ips[0] : req.ip
    
    // Get user ID if authenticated
    const userId = req.user?.id || 'anonymous'
    
    // Combine IP and user ID for more accurate tracking
    return `${ip}:${userId}`
  }

  protected async handleRequest(
    context: ExecutionContext,
    limit: number,
    ttl: number,
  ): Promise<boolean> {
    const { req, res } = this.getRequestResponse(context)
    const tracker = await this.getTracker(req)
    const key = this.generateKey(context, tracker, String(ttl))

    // Get current count from cache
    const currentCount = (await this.cacheManager.get<number>(key)) || 0
    const newCount = currentCount + 1

    // Update count in cache
    await this.cacheManager.set(key, newCount, ttl * 1000)

    // Add rate limit headers
    res.header('X-RateLimit-Limit', String(limit))
    res.header('X-RateLimit-Remaining', String(Math.max(0, limit - newCount)))
    res.header('X-RateLimit-Reset', String(Math.ceil(Date.now() / 1000) + ttl))

    if (newCount > limit) {
      res.header('Retry-After', String(ttl))

      throw new HttpException({
        statusCode: HttpStatus.TOO_MANY_REQUESTS,
        message: 'Too Many Requests',
        retryAfter: ttl,
        limit,
        current: newCount,
      }, HttpStatus.TOO_MANY_REQUESTS)
    }

    // Check if IP is blacklisted
    const isBlacklisted = await this.isIpBlacklisted(req.ip)
    if (isBlacklisted) {
      throw new HttpException({
        statusCode: HttpStatus.FORBIDDEN,
        message: 'IP is blacklisted',
      }, HttpStatus.FORBIDDEN)
    }

    // Add to blacklist if too many consecutive failures
    if (newCount > limit * 2) {
      await this.addToBlacklist(req.ip, ttl * 2)
    }

    return true
  }

  // Custom method to check if IP is in blacklist
  private async isIpBlacklisted(ip: string): Promise<boolean> {
    const blacklisted = await this.cacheManager.get<boolean>(`blacklist:${ip}`)
    return blacklisted === true
  }

  // Custom method to add IP to blacklist
  private async addToBlacklist(ip: string, duration: number): Promise<void> {
    await this.cacheManager.set(`blacklist:${ip}`, true, duration * 1000)
  }
} 