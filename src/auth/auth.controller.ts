import {
  Controller,
  Request,
  Post,
  Get,
  UseGuards,
  Body,
  Patch,
  Param,
  ForbiddenException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';
import { User } from './decorators/user.decorator';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { UserResponseDto } from '../user/dto/user-response.dto';
import { Role } from './enums/role.enum';
import { ResponseDto } from '../common/decorators/response.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  // this line main go to LocalStratgy and validate then go to service Validate then if pass enter in the body of endpoint
  @UseGuards(LocalAuthGuard) // Look to image GardAndPassport.png
  @Post('login')
  async login(@Body() loginDto: LoginDto, @Request() req) {
    return this.authService.login(loginDto);
  }

  @Post('refresh')
  async refreshTokens(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshTokens(refreshTokenDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@User() user: any) {
    await this.authService.logout(user.userId);
    return { message: 'Logged out successfully' };
  }

  // Get current user profile
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @ResponseDto(UserResponseDto)
  getProfile(@User() user: any) {
    return {
      id: user.userId,
      email: user.email,
      name: user.name,
      age: user.age,
      roles: user.roles,
    };
  }

  // Super Admin only - update user roles
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  @Patch('users/:id/roles')
  @ResponseDto(UserResponseDto)
  async updateUserRoles(
    @Param('id') id: string,
    @Body() body: { roles: Role[] },
    @User() currentUser: any,
  ) {
    const targetUser = await this.authService.getUserById(+id);
    if (targetUser.roles.includes(Role.SUPER_ADMIN)) {
      throw new ForbiddenException('Super admin roles cannot be modified');
    }

    if (body.roles.includes(Role.SUPER_ADMIN)) {
      throw new ForbiddenException('Cannot assign super admin role');
    }

    return this.authService.updateUserRoles(+id, body.roles);
  }
}
