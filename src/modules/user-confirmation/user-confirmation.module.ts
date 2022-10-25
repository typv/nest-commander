import { Module } from '@nestjs/common';
import { UserConfirmationService } from './user-confirmation.service';
import { UserConfirmationController } from './user-confirmation.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserConfirmation } from '../../entities/user-confirmation.entity';
import { User } from '../../entities/user.entity';
import { ConfigModule } from '@nestjs/config';
import verifyCodeConfig from 'src/config/verifyCode.config';
import { BullModule } from '@nestjs/bull';
import queueConfig from 'src/config/queue.config';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserConfirmation,
      User,
    ]),
    ConfigModule.forRoot({
      load: [verifyCodeConfig],
    }),
    BullModule.registerQueueAsync({
      name: queueConfig().queue_name.send_mail,
    }),
    AuthModule,
  ],
  controllers: [UserConfirmationController],
  providers: [UserConfirmationService],
  exports: [UserConfirmationService],
})
export class UserConfirmationModule {}
