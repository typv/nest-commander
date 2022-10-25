import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bull';
import { User } from '../../entities/user.entity';
import { UserConfirmation } from '../../entities/user-confirmation.entity';
import queueConfig from 'src/config/queue.config';
import { UserConfirmationModule } from '../user-confirmation/user-confirmation.module';
import verifyCodeConfig from 'src/config/verifyCode.config';
import { AuthModule } from '../auth/auth.module';
import { ResetPasswordController } from './reset-password.controller';
import { ResetPasswordService } from './reset-password.service';

@Module({
  imports: [
    AuthModule,
    UserConfirmationModule,
    TypeOrmModule.forFeature([
      User,
      UserConfirmation,
    ]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
      }),
    }),
    BullModule.registerQueueAsync({
      name: queueConfig().queue_name.send_mail,
    }),
    ConfigModule.forRoot({
      load: [verifyCodeConfig],
    }),
  ],
  controllers: [ResetPasswordController],
  providers: [
    ResetPasswordService,
  ],
  exports: [
    ResetPasswordService,
  ],
})
export class ResetPasswordModule {
}