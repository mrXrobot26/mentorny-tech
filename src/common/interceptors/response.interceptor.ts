import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { plainToClass } from 'class-transformer';
import { RESPONSE_DTO_KEY } from '../decorators/response.decorator';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  constructor(private reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const responseDto = this.reflector.getAllAndOverride(RESPONSE_DTO_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    return next.handle().pipe(
      map((data) => {
        if (!responseDto) return data;
        if (Array.isArray(data))
          return data.map((item) => this.transformToDto(item, responseDto));
        return this.transformToDto(data, responseDto);
      }),
    );
  }

  private transformToDto(data: any, DtoClass: any): any {
    if (data === null || data === undefined) return data;
    if (data instanceof DtoClass) return data;
    return plainToClass(DtoClass, data, {
      excludeExtraneousValues: true,
      enableImplicitConversion: true,
    });
  }
}
