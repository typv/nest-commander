import { CacheModule, Module, ValidationPipe } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import jwtConfiguration from "src/config/jwt.config";
import { I18nModule } from 'nestjs-i18n';
import path from 'path';
import { AuthModule } from '../auth/auth.module';
import { LogHelper } from '../../helpers/log.helper';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import "winston-daily-rotate-file";
import { APP_GUARD, APP_PIPE } from '@nestjs/core';
import { JwtAuthGuard } from '../../guards/jwt.guard';
import { BullModule } from '@nestjs/bull';
import queueConfig from 'src/config/queue.config';
import { MailerModule } from '@nestjs-modules/mailer';
import { EjsAdapter } from '@nestjs-modules/mailer/dist/adapters/ejs.adapter';
import { ResetPasswordModule } from '../reset-password/reset-password.module';
import * as redisStore from 'cache-manager-redis-store';
import { ClientOpts } from 'redis';
import { UserConfirmationModule } from '../user-confirmation/user-confirmation.module';
import dataSourceOptions from '../../../ormconfig';
import { AdminModule } from '../admin/admin.module';

const logHelper = new LogHelper();

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [
        jwtConfiguration,
      ],
    }),
    TypeOrmModule.forRoot(dataSourceOptions),
    I18nModule.forRoot({
      fallbackLanguage: 'en',
      loaderOptions: {
        path: path.join(__dirname, '..', '..', '..', '/lang/'),
        watch: true,
      },
    }),
    WinstonModule.forRoot({
      transports: [
        new winston.transports.DailyRotateFile(logHelper.winstonOptions('error')),
        new winston.transports.DailyRotateFile(logHelper.winstonOptions('debug')),
        new winston.transports.Console({
          handleExceptions: true,
          format: logHelper.consoleLogFormat(),
        })
      ],
    }),
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT) || 6379,
      },
    }),
    BullModule.registerQueueAsync({
      name: queueConfig().queue_name.send_mail,
    }),
    MailerModule.forRootAsync({
      useFactory: async (configService: ConfigService) => ({
        transport: {
          host: process.env.MAIL_HOST,
          port: parseInt(process.env.MAIL_PORT),
          secure: process.env.MAIL_SECURE === "true",
          auth: {
            user: process.env.MAIL_USERNAME,
            pass: process.env.MAIL_PASSWORD,
          },
        },
        defaults: {
          from: process.env.MAIL_FROM_NAME + "<" + process.env.MAIL_FROM_ADDRESS + ">",
        },
        template: {
          dir: process.cwd() + '/src/templates/mailer',
          adapter: new EjsAdapter(),
          options: {
            strict: false,
          },
        },
      }),
    }),
    CacheModule.register<ClientOpts>({
      isGlobal: true,
      store: redisStore,
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT) || 6379,
    }),
    AuthModule,
    ResetPasswordModule,
    UserConfirmationModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
