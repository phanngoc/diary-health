import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET', 'health-blog-secret-key'),
    });
  }

  async validate(payload: any) {
    return { 
      sub: payload.sub, 
      email: payload.email, 
      role: payload.role,
      firstName: payload.firstName,
      lastName: payload.lastName
    };
  }
}
