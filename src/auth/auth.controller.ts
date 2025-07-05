import {
  Controller,
  Request,
  Post,
  UseGuards,
  Body,
  Patch,
  Param,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Role } from './enums/role.enum';

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

  // Admin only - update user roles
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Patch('users/:id/roles')
  async updateUserRoles(
    @Param('id') id: string,
    @Body() body: { roles: Role[] },
  ) {
    return this.authService.updateUserRoles(+id, body.roles);
  }

  // Special endpoint to create first admin (remove this after creating first admin)
  @Post('create-first-admin')
  async createFirstAdmin(@Body() registerDto: RegisterDto) {
    const createUserDto = {
      ...registerDto,
      roles: [Role.ADMIN],
    };
    return this.authService.createFirstAdmin(createUserDto);
  }
}
