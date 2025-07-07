import { SetMetadata } from '@nestjs/common';

export const RESPONSE_DTO_KEY = 'response_dto';

export const ResponseDto = (dto : any) => SetMetadata(RESPONSE_DTO_KEY, dto) 