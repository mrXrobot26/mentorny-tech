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

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUserInService(email: string, password: string): Promise<any> {
    try {
      const user = await this.userService.findOneByEmail(email);
      if (user && (await bcrypt.compare(password, user.password))) {
        const { password, ...result } = user;
        return result;
      }
      return null;
    } catch (error) {
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
        const payload = { email: user.email, sub: user.id };
        return {
             user: {
                id: user.id,
                email: user.email,
                name: user.name,
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
      const user = await this.userService.create(registerDto);
      const { password, ...result } = user;

      const payload = { email: user.email, sub: user.id };
      return {
        access_token: this.jwtService.sign(payload),
        user: result,
      };
    } catch (error) {
      throw new BadRequestException('Registration failed');
    }
  }
}
