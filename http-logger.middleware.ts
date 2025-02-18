import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class HttpLoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP'); // Create a logger instance with 'HTTP' context

  use(req: Request, res: Response, next: NextFunction): void {
    const { ip, method, baseUrl } = req; // Extract request details
    const userAgent = req.get('user-agent') ?? ''; // Get user agent or empty string if not present
    const startAt = process.hrtime.bigint(); // Record start time for performance measurement

    const logResponse = () => {
      const { statusCode } = res; // Get response status code
      const contentLength = res.get('content-length') || '0'; // Get content length or default to '0'
      const responseTime = Number(process.hrtime.bigint() - startAt) / 1e6; // Calculate response time in milliseconds

      // Log the request details and response metrics
      this.logger.log(
        `${method} ${baseUrl} ${statusCode} ${contentLength}byte ${responseTime.toFixed(2)}ms - ${userAgent} ${ip}`,
      );

      res.off('finish', logResponse); // Remove the event listener to prevent memory leaks
    };

    res.on('finish', logResponse); // Attach event listener for when response finishes
    next(); // Continue to the next middleware
  }
}
