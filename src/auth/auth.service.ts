import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import {
  UnauthorizedException,
  BadRequestException,
  Injectable,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt/dist/jwt.service';
import { UserService } from 'src/user/user.service';
import * as bcrypt from 'bcrypt';
import { Role } from './enums/role.enum';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUserInService(email: string, password: string) {
    try {
      const user = await this.userService.findOneByEmail(email);
      if (user && (await bcrypt.compare(password, user.password))) {
        const { password, ...result } = user;
        return result;
      }
      return null;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async login(loginDto: LoginDto): Promise<any> {
    try {
      const user = await this.validateUserInService(
        loginDto.email,
        loginDto.password,
      );
      if (!user) {
        throw new UnauthorizedException('Invalid credentials');
      }
      const payload = { email: user.email, sub: user.id, roles: user.roles };
      return {
        access_token: this.jwtService.sign(payload),
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          roles: user.roles,
        },
      };
    } catch (error) {
      throw new UnauthorizedException('Login failed');
    }
  }

  async register(registerDto: RegisterDto): Promise<any> {
    const existingUser = await this.userService.findOneByEmail(
      registerDto.email,
    );
    if (existingUser) {
      throw new BadRequestException('Email already exists');
    }
    try {
      const createUserDto = {
        ...registerDto,
        roles: [Role.USER],
      };

      const user = await this.userService.create(createUserDto);
      const { password, ...result } = user;

      const payload = { email: user.email, sub: user.id, roles: user.roles };
      return {
        user: result,
        access_token: this.jwtService.sign(payload),
      };
    } catch (error) {
      console.log(error);
      throw new BadRequestException('Registration failed');
    }
  }

  // Admin method to change user roles
  async updateUserRoles(userId: number, roles: Role[]) {
    const user = await this.userService.findOne(userId);
    const updatedUser = await this.userService.update(userId, { roles });
    return updatedUser;
  }

  // Special method to create first admin (should be removed after creating first admin)
  async createFirstAdmin(createUserDto: any): Promise<any> {
    const existingUser = await this.userService.findOneByEmail(
      createUserDto.email,
    );
    if (existingUser) {
      throw new BadRequestException('Email already exists');
    }
    try {
      const user = await this.userService.create(createUserDto);
      const { password, ...result } = user;

      const payload = { email: user.email, sub: user.id, roles: user.roles };
      return {
        user: result,
        access_token: this.jwtService.sign(payload),
      };
    } catch (error) {
      console.log(error);
      throw new BadRequestException('Admin creation failed');
    }
  }
}
