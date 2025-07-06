import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import {
  UnauthorizedException,
  BadRequestException,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt/dist/jwt.service';
import { UserService } from 'src/user/user.service';
import * as bcrypt from 'bcrypt';
import { Role } from './enums/role.enum';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { UserResponseDto } from '../user/dto/user-response.dto';
import { randomBytes } from 'crypto';

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
      
      const tokens = await this.generateTokens(user);
      
      // Store hashed refresh token in database
      await this.storeRefreshToken(user.id, tokens.refresh_token);
      
      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          age: user.age,
          roles: user.roles,
        },
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
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
      
      const tokens = await this.generateTokens(user);
      
      // Store hashed refresh token in database
      await this.storeRefreshToken(user.id, tokens.refresh_token);

      return {
        user: user,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
      };
    } catch (error) {
      console.log(error);
      throw new BadRequestException('Registration failed');
    }
  }

  private async generateTokens(user: any) {
    const payload = { email: user.email, sub: user.id, roles: user.roles };
    
    // Generate short-lived access token
    const access_token = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: process.env.JWT_ACCESS_EXPIRATION,
    });
    
    // Generate random refresh token (more secure for database storage)
    const refresh_token = this.generateRefreshToken();

    return {
      access_token,
      refresh_token,
    };
  }

  private generateRefreshToken(): string {
    return randomBytes(32).toString('hex');
  }

  private async storeRefreshToken(userId: number, refreshToken: string): Promise<void> {
    // Hash the refresh token before storing
    const hashedToken = await bcrypt.hash(refreshToken, 10);
    
    // Calculate expiration date
    const expiration = process.env.JWT_REFRESH_EXPIRATION || '7d';
    const expiresAt = this.calculateExpirationDate(expiration);
    
    // Store through user service (proper layer separation)
    await this.userService.updateRefreshToken(userId, hashedToken, expiresAt);
  }

  private calculateExpirationDate(expiration: string): Date {
    const match = expiration.match(/^(\d+)([smhd])$/);
    let expiresInMs = 7 * 24 * 60 * 60 * 1000; // Default 7 days
    
    if (match) {
      const value = parseInt(match[1], 10);
      const unit = match[2];
      
      switch (unit) {
        case 's':
          expiresInMs = value * 1000;
          break;
        case 'm':
          expiresInMs = value * 60 * 1000;
          break;
        case 'h':
          expiresInMs = value * 60 * 60 * 1000;
          break;
        case 'd':
          expiresInMs = value * 24 * 60 * 60 * 1000;
          break;
      }
    }
    
    return new Date(Date.now() + expiresInMs);
  }

  async refreshTokens(refreshTokenDto: RefreshTokenDto): Promise<any> {
    try {
      const { refreshToken } = refreshTokenDto;
      
      // Find user by refresh token
      const user = await this.userService.findUserByRefreshToken(refreshToken);
      if (!user) {
        throw new UnauthorizedException('Invalid refresh token');
      }
      
      // Check if refresh token is expired
      if (user.refreshTokenExpiresAt < new Date()) {
        // Clean up expired token
        await this.userService.clearRefreshToken(user.id);
        throw new UnauthorizedException('Refresh token expired');
      }
      
      // Generate new tokens (token rotation for security)
      const tokens = await this.generateTokens(user);
      
      // Store new hashed refresh token
      await this.storeRefreshToken(user.id, tokens.refresh_token);
      
      return {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async logout(userId: number): Promise<void> {
    await this.userService.clearRefreshToken(userId);
  }

  async getUserById(userId: number): Promise<UserResponseDto> {
    return await this.userService.findOne(userId);
  }

  // Super Admin method to change user roles
  async updateUserRoles(userId: number, roles: Role[]): Promise<UserResponseDto> {
    const user = await this.userService.findOneEntity(userId);
    if (user.roles.includes(Role.SUPER_ADMIN)) {
      throw new ForbiddenException('Super admin roles cannot be modified');
    }
    if (roles.includes(Role.SUPER_ADMIN)) {
      throw new ForbiddenException('Cannot assign super admin role');
    }
    if (!roles.includes(Role.USER)) {
      roles.push(Role.USER);
    }
    return await this.userService.update(userId, { roles });
  }
}
