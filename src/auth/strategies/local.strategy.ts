import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'email', // Use email instead of username
    });
  }
  
  async validate(email: string, password: string) {
    const user = await this.authService.validateUserInService(email, password);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
