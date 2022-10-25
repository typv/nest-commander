import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import bcrypt from 'bcrypt';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { ConfigType } from '@nestjs/config';
import { I18nService } from 'nestjs-i18n';
import { User } from '../../entities/user.entity';
import { BaseService } from '../base/base.service';
import verifyCodeConfig from 'src/config/verifyCode.config';
import expireConfigure from 'src/config/expire.config';
import { UserConfirmation } from '../../entities/user-confirmation.entity';
import { GoogleLoginDto } from './dto/google-login.dto';
import { RegisterDto } from './dto/register.dto';
import { AuthDto } from './dto/auth.dto';
import { GoogleAuthService } from '../google-auth/google-auth.service';

@Injectable()
export class AuthService extends BaseService {
  constructor(
    @InjectRepository(User) private userRepos: Repository<User>,
    @InjectRepository(UserConfirmation) private confirmationRepos: Repository<UserConfirmation>,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    @Inject(REQUEST) private readonly request: Request,
    @Inject(verifyCodeConfig.KEY) private codeConfig: ConfigType<typeof verifyCodeConfig>,
    @Inject(expireConfigure.KEY) private expireConfig: ConfigType<typeof expireConfigure>,
    private jwtService: JwtService,
    private googleAuthService: GoogleAuthService,
    private readonly trans: I18nService,
    private dataSource: DataSource,
  ) {
    super();
  }
  
  async login(body: AuthDto) {
    const user = await this.userRepos.findOneBy({ email: body.email });
    if (!user) {
      throw new UnauthorizedException(
        this.trans.t('messages.NOT_FOUND', { args: { object: 'User' } }),
      );
    }
    const matchPw = await bcrypt.compare(body.password, user.password);
    if (!matchPw) {
      throw new UnauthorizedException();
    }
    if (!user.isActive) {
      throw new UnauthorizedException('Account has been locked.');
    }
    const payload = await this.makePayload(user);
    
    return this.responseOk({
      access_token: this.jwtService.sign(payload),
    });
  }
  
  /*async googleSignIn(body: GoogleLoginDto) {
    let googleAuthPayload;
    try {
      googleAuthPayload = await this.googleAuthService.verify(body['idToken']);
    } catch (err) {
      this.logger.error(err.stack);
      
      throw new UnauthorizedException();
    }
    
    const email = googleAuthPayload['email'] || null;
    if (!email) {
      throw new BadRequestException(
        'Email not found, please granted the "email" OAuth scopes to the application.',
      );
    }
    
    let payload, user;
    user = await this.userRepos.findOne({ where: { email: email } });
    if (!user) {
      // Case: Register
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();
      try {
        const filterData = {
          email: email,
          emailVerified: true,
        };
        user = await queryRunner.manager.save(User, filterData);
        
        await queryRunner.commitTransaction();
      } catch (err) {
        this.logger.error(err.stack);
        await queryRunner.rollbackTransaction();
        
        throw new BadRequestException('Register failed.');
      } finally {
        await queryRunner.release();
      }
    }
    if (user.isActive == false) {
      throw new UnauthorizedException('Account has been locked.');
    }
    payload = await this.makePayload(user);
    
    return this.responseOk({
      access_token: this.jwtService.sign(payload),
    });
  }*/
  
  public async makePayload(user: User) {
    return {
      email: user.email || '',
      userName: user.userName || '',
      emailVerified: user.emailVerified || false,
      sub: user.id || '',
    };
  }
  
  /*async register(body: RegisterDto) {
    const hasAccount = await this.userRepos.findOne({
      where: { email: body.email },
    });
    if (hasAccount) {
      throw new BadRequestException('Account already exists.');
    }
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const salt = await bcrypt.genSalt();
      const password = await bcrypt.hash(body.password, salt);
      
      // Save account
      const accountData = {
        email: body.email,
        userName: body.userName,
        password: password,
      };
      await queryRunner.manager.save(User, accountData);
      await queryRunner.commitTransaction();
      
      return this.responseOk();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      this.logger.error(err.stack);
      
      throw new InternalServerErrorException();
    } finally {
      await queryRunner.release();
    }
  }*/
  
  public getUser(options = {}): Promise<User> {
    const authUser = this.request.user;
    if (!authUser) {
      return null;
    }
    
    return this.userRepos.findOneBy({ id: authUser['id'] });
  }
}
