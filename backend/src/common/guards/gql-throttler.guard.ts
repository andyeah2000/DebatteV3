import { Injectable, ExecutionContext } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class GqlThrottlerGuard extends ThrottlerGuard {
  protected getRequest(context: ExecutionContext): any {
    try {
      const gqlContext = GqlExecutionContext.create(context);
      const ctx = gqlContext.getContext();
      if (ctx && ctx.req) {
        return ctx.req;
      }
    } catch (e) { /* ignore error */ }
    const httpRequest = context.switchToHttp().getRequest();
    return httpRequest ? httpRequest : {};
  }

  protected async getTracker(request: Record<string, any>): Promise<string> {
    if (!request || !request.ip) {
      return 'unknown';
    }
    return request.ip;
  }

  protected async handleRequest(
    context: ExecutionContext,
    limit: number,
    ttl: number,
  ): Promise<boolean> {
    const request = this.getRequest(context);
    const tracker = await this.getTracker(request);
    const key = this.generateKey(context, tracker, String(ttl));
    const { totalHits, timeToExpire } = await this.storageService.increment(key, ttl);

    if (totalHits > limit) {
      return false;
    }

    return true;
  }
} 