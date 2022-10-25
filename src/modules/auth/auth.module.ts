import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../entities/user.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
import verifyCodeConfig from 'src/config/verifyCode.config';
import expireConfigure from 'src/config/expire.config';
import { GoogleAuthModule } from '../google-auth/google-auth.module';
import { UserConfirmation } from '../../entities/user-confirmation.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      UserConfirmation,
    ]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('jwt.secret'),
        signOptions: {
          expiresIn: configService.get<string | number>('jwt.expiresIn'),
        },
      }),
    }),
    ConfigModule.forRoot({
      load: [
        verifyCodeConfig,
        expireConfigure
      ],
    }),
    GoogleAuthModule,
    PassportModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
  ],
  exports: [AuthService],
})
export class AuthModule {}
