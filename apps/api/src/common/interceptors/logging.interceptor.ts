import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { type Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body, query, params, headers } = request;
    const userAgent = headers['user-agent'] || '';
    const ip = request.ip || request.socket?.remoteAddress || 'unknown';

    const startTime = Date.now();

    this.logger.log(
      `Incoming Request: ${method} ${url} - IP: ${ip} - User-Agent: ${userAgent}`,
    );

    // Log request details (excluding sensitive data)
    const logData: Record<string, unknown> = {
      method,
      url,
      query: Object.keys(query).length > 0 ? query : undefined,
      params: Object.keys(params).length > 0 ? params : undefined,
      body: this.sanitizeBody(body),
    };

    // Remove undefined values for cleaner logs
    Object.keys(logData).forEach(
      (key) => logData[key] === undefined && delete logData[key],
    );

    if (Object.keys(logData).length > 2) {
      this.logger.debug(`Request details: ${JSON.stringify(logData)}`);
    }

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = Date.now() - startTime;
          this.logger.log(
            `Request completed: ${method} ${url} - ${duration}ms`,
          );
        },
        error: (error) => {
          const duration = Date.now() - startTime;
          this.logger.error(
            `Request failed: ${method} ${url} - ${duration}ms - ${error.message}`,
          );
        },
      }),
    );
  }

  private sanitizeBody(body: unknown): unknown {
    const sensitiveFields = [
      'password',
      'token',
      'secret',
      'apiKey',
      'authorization',
    ];

    const isSensitiveKey = (key: string): boolean => {
      const lowerKey = key.toLowerCase();
      return (
        sensitiveFields.some((field) => lowerKey === field.toLowerCase()) ||
        lowerKey.endsWith('password') ||
        lowerKey.endsWith('token') ||
        lowerKey.endsWith('secret') ||
        lowerKey.endsWith('key')
      );
    };

    const sanitizeRecursive = (
      value: unknown,
      visited: WeakSet<object> = new WeakSet(),
    ): unknown => {
      // Handle primitives and null
      if (value === null || typeof value !== 'object') {
        return value;
      }

      // Guard against circular references
      if (visited.has(value as object)) {
        return '[CIRCULAR]';
      }

      // Handle arrays
      if (Array.isArray(value)) {
        visited.add(value);
        return value.map((item) => sanitizeRecursive(item, visited));
      }

      // Handle objects
      visited.add(value as object);
      const sanitized: Record<string, unknown> = {};

      for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
        if (isSensitiveKey(key)) {
          sanitized[key] = '[REDACTED]';
        } else {
          sanitized[key] = sanitizeRecursive(val, visited);
        }
      }

      return sanitized;
    };

    return sanitizeRecursive(body);
  }
}
