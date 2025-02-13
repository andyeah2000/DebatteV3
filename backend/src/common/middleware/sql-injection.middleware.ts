import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class SqlInjectionMiddleware implements NestMiddleware {
  private readonly sqlInjectionPattern = /('|"|;|--|\/\*|\*\/|@@|@|char|nchar|varchar|nvarchar|alter|begin|cast|create|cursor|declare|delete|drop|end|exec|execute|fetch|insert|kill|open|select|sys|table|update)/gi;

  use(req: Request, res: Response, next: NextFunction) {
    // Check query parameters
    if (req.query) {
      for (const key in req.query) {
        if (this.checkForSqlInjection(req.query[key])) {
          return res.status(403).json({
            message: 'Potential SQL injection detected',
            statusCode: 403,
          });
        }
      }
    }

    // Check request body
    if (req.body) {
      const bodyStr = JSON.stringify(req.body);
      if (this.checkForSqlInjection(bodyStr)) {
        return res.status(403).json({
          message: 'Potential SQL injection detected',
          statusCode: 403,
        });
      }
    }

    next();
  }

  private checkForSqlInjection(value: any): boolean {
    if (typeof value !== 'string') {
      return false;
    }

    // Decode URI components to catch encoded attacks
    const decodedValue = decodeURIComponent(value);
    
    // Check for SQL injection patterns
    return this.sqlInjectionPattern.test(decodedValue);
  }
} 