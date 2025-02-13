import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { MetricsService } from './metrics.service';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  constructor(private readonly metricsService: MetricsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const startTime = Date.now();
    const isHttp = context.getType() === 'http';
    
    let path = 'unknown';
    let method = 'unknown';
    let statusCode = 200;

    if (isHttp) {
      const request = context.switchToHttp().getRequest();
      path = request.route?.path || 'unknown';
      method = request.method || 'unknown';
    } else {
      const gqlContext = GqlExecutionContext.create(context);
      const info = gqlContext.getInfo();
      path = info?.fieldName || 'unknown';
      method = 'GRAPHQL';
    }

    // Increment request counter
    this.metricsService.incrementHttpRequests(method, path, statusCode);

    return next.handle().pipe(
      tap({
        next: () => {
          // Record request duration
          const duration = Date.now() - startTime;
          this.metricsService.observeHttpRequestDuration(method, path, duration);
          
          // Increment success counter
          this.metricsService.incrementHttpRequests(method, path, 200);
        },
        error: (error) => {
          // Record request duration even for errors
          const duration = Date.now() - startTime;
          this.metricsService.observeHttpRequestDuration(method, path, duration);
          
          // Increment error counter with status code
          const errorStatus = error.status || 500;
          this.metricsService.incrementHttpRequests(method, path, errorStatus);
        },
      }),
    );
  }
} 