import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class SecurityInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    try {
      const ctx = GqlExecutionContext.create(context);
      const gqlContext = ctx.getContext();

      // Only proceed if we have a valid response object
      if (gqlContext?.res && typeof gqlContext.res.setHeader === 'function') {
        const res = gqlContext.res;

        // Add security headers
        const headers = {
          'X-Content-Type-Options': 'nosniff',
          'X-Frame-Options': 'SAMEORIGIN',
          'X-XSS-Protection': '1; mode=block',
          'Referrer-Policy': 'strict-origin-when-cross-origin',
          'X-Request-Id': uuidv4(),
        };

        // Safely set headers
        Object.entries(headers).forEach(([key, value]) => {
          try {
            res.setHeader(key, value);
          } catch (error) {
            console.warn(`Failed to set header ${key}:`, error);
          }
        });
      }

      // Add timing attack protection
      const start = Date.now();
      return next.handle().pipe(
        tap(() => {
          const duration = Date.now() - start;
          const minDuration = 100; // Minimum response time in milliseconds
          if (duration < minDuration) {
            return new Promise(resolve => 
              setTimeout(resolve, minDuration - duration)
            );
          }
        }),
      );
    } catch (error) {
      console.error('Error in SecurityInterceptor:', error);
      return next.handle(); // Continue with the request even if security headers fail
    }
  }
} 