import { IsInt, IsString, IsNotEmpty, IsEmail, IsArray, IsEnum } from 'class-validator';
import { Role } from '../../auth/enums/role.enum';

export class CreateUserDto {
  @IsEmail()
  @IsString()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsInt()
  age: number;

  @IsArray()
  @IsEnum(Role, { each: true })
  roles: Role[];
}
