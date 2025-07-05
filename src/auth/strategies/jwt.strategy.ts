import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { UserService } from '../../user/user.service';
import * as dotenv from 'dotenv';
dotenv.config();
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly userService: UserService) {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET environment variable is not set');
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });
  }

  async validate(payload: any) {
    console.log(`Validating JWT payload: ${JSON.stringify(payload)}`);
    const user = await this.userService.findOne(payload.sub);
    return {
      userId: user.id,
      email: user.email,
      roles: user.roles,
    };
  }
}
