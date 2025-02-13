import { Request, Response } from 'express';
import { IncomingMessage } from 'http';
import { ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { v4 as uuidv4 } from 'uuid';

export interface GraphQLRequest {
  id: string;
  ip: string;
  headers: IncomingMessage['headers'];
  user?: any;
  body: any;
  query?: any;
  method: string;
  url: string;
  socket?: {
    remoteAddress?: string;
  };
}

export interface GraphQLContext {
  req: GraphQLRequest;
  res: Response;
}

export class GraphQLContextBuilder {
  static build(req: Request | any, res: Response): GraphQLContext {
    try {
      // Get the raw request object
      const request = req?.raw || req;
      
      // Extract context from request body if available
      const bodyContext = request?.body?.context || {};
      
      // Get IP with multiple fallbacks
      const ip = this.getClientIp({
        headers: {
          ...request?.headers,
          'x-forwarded-for': request?.headers?.['x-forwarded-for'] || bodyContext?.headers?.['x-forwarded-for'],
          'x-real-ip': request?.headers?.['x-real-ip'] || bodyContext?.headers?.['x-real-ip'],
        },
        socket: request?.socket,
        connection: request?.connection,
        ip: request?.ip || bodyContext?.ip,
      });

      // Get headers with fallbacks to body context
      const headers = this.normalizeHeaders({
        ...request?.headers,
        ...bodyContext?.headers,
        'user-agent': bodyContext?.userAgent || request?.headers?.['user-agent'],
        'origin': bodyContext?.origin || request?.headers?.origin,
        'referer': bodyContext?.referer || request?.headers?.referer,
        'x-forwarded-for': ip,
        'x-real-ip': ip,
      });

      // Create standardized request object
      const standardizedRequest: GraphQLRequest = {
        id: uuidv4(),
        ip: ip || 'unknown',
        headers,
        body: request?.body || {},
        method: request?.method || 'POST',
        url: request?.url || '/graphql',
        socket: {
          remoteAddress: ip || 'unknown',
        },
        user: request?.user || null,
      };

      const response = res || this.createDefaultResponse();
      response.header = (function(...args: any[]): any {
          if (args.length === 1) {
              const field = args[0];
              if (typeof this.getHeader === 'function') {
                  return this.getHeader(field);
              }
              return null;
          }
          if (args.length >= 2) {
              const field = args[0], value = args[1];
              if (typeof this.setHeader === 'function') {
                  this.setHeader(field, value);
              }
              return this;
          }
      }).bind(response);
      return { 
        req: standardizedRequest,
        res: response,
      };
    } catch (error) {
      console.error('Error in GraphQLContextBuilder.build:', error);
      return this.createDefaultContext('unknown');
    }
  }

  static buildFromExecutionContext(context: ExecutionContext): GraphQLContext {
    try {
      if (!context) {
        console.warn('No context provided to buildFromExecutionContext');
        return this.createDefaultContext('unknown');
      }

      const gqlContext = GqlExecutionContext.create(context);
      const ctx = gqlContext.getContext();

      if (!ctx || !ctx.req) {
        console.warn('No GraphQL context or request object available');
        return this.createDefaultContext('unknown');
      }

      const req = ctx.req.raw || ctx.req;
      const res = ctx.res || this.createDefaultResponse();

      return this.build(req, res);
    } catch (error) {
      console.error('Error building context from execution context:', error);
      return this.createDefaultContext('unknown');
    }
  }

  private static getClientIp(req: any): string {
    try {
      // Array of possible IP sources
      const ipSources = [
        req.headers?.['x-forwarded-for']?.split(',')[0]?.trim(),
        req.headers?.['x-real-ip'],
        req.socket?.remoteAddress,
        req.connection?.remoteAddress,
        req.ip,
        'unknown'
      ];

      // Return first non-null, non-undefined, non-empty value
      return ipSources.find(ip => ip && ip !== 'undefined' && ip !== '') || 'unknown';
    } catch (error) {
      console.error('Error getting client IP:', error);
      return 'unknown';
    }
  }

  private static normalizeHeaders(headers: Record<string, any>): IncomingMessage['headers'] {
    try {
      if (!headers || typeof headers !== 'object') {
        return {
          'user-agent': 'unknown',
          'origin': 'unknown',
          'referer': 'unknown',
          'x-forwarded-for': 'unknown',
          'x-real-ip': 'unknown',
        };
      }

      const normalized = Object.entries(headers).reduce((acc, [key, value]) => {
        if (value && value !== 'undefined') {
          acc[key.toLowerCase()] = Array.isArray(value) ? value[0] : value;
        }
        return acc;
      }, {} as Record<string, any>);

      // Ensure required headers exist
      const requiredHeaders = ['user-agent', 'origin', 'referer', 'x-forwarded-for', 'x-real-ip'];
      requiredHeaders.forEach(header => {
        if (!normalized[header]) {
          normalized[header] = 'unknown';
        }
      });

      return normalized;
    } catch (error) {
      console.error('Error normalizing headers:', error);
      return {
        'user-agent': 'unknown',
        'origin': 'unknown',
        'referer': 'unknown',
        'x-forwarded-for': 'unknown',
        'x-real-ip': 'unknown',
      };
    }
  }

  static createDefaultContext(fallbackIp: string): GraphQLContext {
    const ip = fallbackIp || 'unknown';
    const mockReq: GraphQLRequest = {
      id: uuidv4(),
      ip,
      headers: {
        'user-agent': 'unknown',
        'origin': 'unknown',
        'referer': 'unknown',
        'x-forwarded-for': ip,
        'x-real-ip': ip,
        'host': 'unknown',
        'content-type': 'application/json',
      },
      body: {},
      method: 'POST',
      url: '/graphql',
      socket: {
        remoteAddress: ip
      },
      user: null,
    };

    return {
      req: mockReq,
      res: this.createDefaultResponse(),
    };
  }

  private static createDefaultResponse(): Response {
    return {
      setHeader: () => {},
      getHeader: () => null,
      header: function(key: string, value: string) { this.setHeader(key, value); return this; },
      status: function() { return this; },
      json: function() { return this; },
      send: function() { return this; },
    } as unknown as Response;
  }
} 