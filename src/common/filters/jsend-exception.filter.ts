import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { JSendUtil } from '../utils/jsend.util';

@Catch()
export class JSendExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let code: string | number | undefined;
    let data: any;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      
      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const responseObj = exceptionResponse as any;
        message = responseObj.message || responseObj.error || exception.message;
        code = responseObj.statusCode;
        
        // Handle validation errors (class-validator)
        if (responseObj.message && Array.isArray(responseObj.message)) {
          // This is a validation error - treat as 'fail'
          const jsendResponse = JSendUtil.fail({
            validation: responseObj.message,
            error: responseObj.error || 'Validation failed',
          });
          return response.status(status).json(jsendResponse);
        }
      }
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    // Determine if this should be a 'fail' or 'error' response
    if (status >= 400 && status < 500) {
      // Client errors (4xx) - use 'fail' status
      const jsendResponse = JSendUtil.fail({
        message,
        statusCode: status,
      });
      response.status(status).json(jsendResponse);
    } else {
      // Server errors (5xx) - use 'error' status
      const jsendResponse = JSendUtil.error(message, code, data);
      response.status(status).json(jsendResponse);
    }
  }
} 