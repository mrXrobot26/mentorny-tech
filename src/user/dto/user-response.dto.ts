import { Expose } from 'class-transformer';
import { Role } from '../../auth/enums/role.enum';

export class UserResponseDto {
  @Expose()
  id: number;

  @Expose()
  email: string;

  @Expose()
  name: string;

  @Expose()
  age: number;

  @Expose()
  roles: Role[];
}
