import { Catch, ArgumentsHost } from '@nestjs/common'
import { GqlExceptionFilter, GqlArgumentsHost } from '@nestjs/graphql'
import { GraphQLError } from 'graphql'
import { GraphQLContextBuilder } from '../builders/graphql-context.builder'

@Catch()
export class GraphQLExceptionFilter implements GqlExceptionFilter {
  catch(exception: Error, host: ArgumentsHost) {
    try {
      const gqlHost = GqlArgumentsHost.create(host)
      const context = GraphQLContextBuilder.buildFromExecutionContext(gqlHost)
      
      // Create base error log object with essential information
      const errorLog: any = {
        message: exception.message,
        timestamp: new Date().toISOString(),
        requestId: context?.req?.id || 'unknown',
      }

      // Only add path information if it exists
      const query = context?.req?.body?.query || context?.req?.body?.operationName
      if (query) {
        errorLog['path'] = query
      }

      // Safely add client information if available
      errorLog['clientInfo'] = {
        userAgent: context?.req?.headers?.['user-agent'] || 'unknown',
        origin: context?.req?.headers?.origin || context?.req?.headers?.referer || 'unknown',
        ip: context?.req?.ip || 'unknown',
      }

      // Log the error for debugging
      console.error('GraphQL Error:', {
        ...errorLog,
        stack: exception.stack,
      })

      // Convert to GraphQL error with proper formatting
      return new GraphQLError(exception.message, {
        extensions: {
          code: this.getErrorCode(exception),
          ...errorLog,
        },
      })
    } catch (error) {
      console.error('Error in GraphQL Exception Filter:', error)
      // Return a safe default error if something goes wrong
      return new GraphQLError('Internal server error', {
        extensions: {
          code: 'INTERNAL_SERVER_ERROR',
          timestamp: new Date().toISOString(),
          clientInfo: {
            userAgent: 'unknown',
            origin: 'unknown',
            ip: 'unknown',
          },
        },
      })
    }
  }

  private getErrorCode(error: Error): string {
    // Map common error types to appropriate codes
    if (error.name === 'ValidationError') return 'VALIDATION_ERROR'
    if (error.name === 'UnauthorizedException') return 'UNAUTHORIZED'
    if (error.name === 'ForbiddenException') return 'FORBIDDEN'
    if (error.name === 'NotFoundException') return 'NOT_FOUND'
    return 'INTERNAL_SERVER_ERROR'
  }
} 