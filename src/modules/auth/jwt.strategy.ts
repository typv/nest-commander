import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";
import jwtConfigure from '../../config/jwt.config';
import { ConfigType } from '@nestjs/config';
import { User } from '../../entities/user.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @Inject(jwtConfigure.KEY) private jwtConfig: ConfigType<typeof jwtConfigure>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConfig.secret,
    });
  }
  
  async validate(payload: any) {
    const user = await this.userRepo.findOneBy({id: payload.sub});
    if (!user) {
      throw new UnauthorizedException();
    }
    
    return user;
  }
}