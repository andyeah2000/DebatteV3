import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from '@nestjs/common';
import { GqlArgumentsHost } from '@nestjs/graphql';
import { FilterXSS } from 'xss';

@Catch()
export class XssFilter implements ExceptionFilter {
  private readonly xssFilter: FilterXSS;
  private readonly options = {
    whiteList: {}, // No tags are allowed
    stripIgnoreTag: true, // Strip tags that are not in whitelist
    stripIgnoreTagBody: ['script'], // Strip these tags and their contents
  };

  constructor() {
    this.xssFilter = new FilterXSS(this.options);
  }

  catch(exception: Error, host: ArgumentsHost) {
    // Added guard: if the request type is not HTTP, just return the exception without processing
    if (host.getType() !== 'http') {
      return exception;
    }
    try {
      // For GraphQL requests
      if (host.getType<string>() === 'graphql') {
        const gqlHost = GqlArgumentsHost.create(host);
        const context = gqlHost.getContext();
        
        // Only clean if we have a valid context and request
        if (context?.req) {
          // Create a clean copy of the request data
          const cleanReq = { ...context.req };
          
          // Clean body if it exists
          if (cleanReq.body && typeof cleanReq.body === 'object') {
            cleanReq.body = this.cleanXss(cleanReq.body);
          }
          
          // Clean query if it exists
          if (cleanReq.query && typeof cleanReq.query === 'object') {
            cleanReq.query = this.cleanXss(cleanReq.query);
          }
          
          // Preserve original headers
          context.req = {
            ...cleanReq,
            headers: context.req.headers || {},
          };
        }

        // Return the original exception if it's already an HttpException
        if (exception instanceof HttpException) {
          return exception;
        }

        // Return a sanitized error
        return new HttpException(
          this.cleanXss(exception.message || 'An error occurred'),
          500
        );
      }

      // For HTTP requests
      const ctx = host.switchToHttp();
      const request = ctx.getRequest();
      
      // Only clean if we have a valid request
      if (request) {
        // Create a clean copy of the request
        const cleanRequest = { ...request };
        
        // Clean body if it exists
        if (cleanRequest.body && typeof cleanRequest.body === 'object') {
          cleanRequest.body = this.cleanXss(cleanRequest.body);
        }
        
        // Clean query if it exists
        if (cleanRequest.query && typeof cleanRequest.query === 'object') {
          cleanRequest.query = this.cleanXss(cleanRequest.query);
        }
        
        // Preserve original headers
        Object.assign(request, {
          ...cleanRequest,
          headers: request.headers || {},
        });
      }

      // Return the original exception if it's already an HttpException
      if (exception instanceof HttpException) {
        return exception;
      }

      // Return a sanitized error
      return new HttpException(
        this.cleanXss(exception.message || 'An error occurred'),
        500
      );
    } catch (error) {
      console.error('XssFilter error:', error);
      // Return original exception if XSS filtering fails
      return exception;
    }
  }

  private cleanXss(obj: any): any {
    try {
      if (!obj) return obj;
      
      if (typeof obj !== 'object') {
        return typeof obj === 'string' ? this.xssFilter.process(obj) : obj;
      }

      const cleaned = Array.isArray(obj) ? [] : {};
      
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          cleaned[key] = this.cleanXss(obj[key]);
        }
      }

      return cleaned;
    } catch (error) {
      console.error('Error in cleanXss:', error);
      return obj;
    }
  }
} 