import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Connection, Repository } from 'typeorm';
import { MailerService } from '@nestjs-modules/mailer';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { ConfigType } from '@nestjs/config';
import { I18nService } from 'nestjs-i18n';
import { BaseService } from '../base/base.service';
import { User } from '../../entities/user.entity';
import { UserConfirmation } from '../../entities/user-confirmation.entity';
import verifyCodeConfig from 'src/config/verifyCode.config';
import queueConfig from 'src/config/queue.config';
import { UserConfirmationService } from '../user-confirmation/user-confirmation.service';
import { accountConfirmationType } from '../../constants/enum';
import { VerifyDto } from './dto/verify.dto';
import { AuthService } from '../auth/auth.service';
import { SendCodeDto } from './dto/send-code.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Injectable()
export class ResetPasswordService extends BaseService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(UserConfirmation) private confirmationRepo: Repository<UserConfirmation>,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    @InjectQueue(queueConfig().queue_name.send_mail) private mailQueue: Queue,
    @Inject(verifyCodeConfig.KEY) private codeConfig: ConfigType<typeof verifyCodeConfig>,
    private readonly mailerService: MailerService,
    private readonly authService: AuthService,
    private jwtService: JwtService,
    private connection: Connection,
    private readonly confirmationService: UserConfirmationService,
    private readonly trans: I18nService,
  ) {
    super();
  }
  
  async sendCode(body: SendCodeDto) {
    const hasAccount = await this.userRepo.findOne({ where: { email: body.email } });
    if (!hasAccount) {
      throw new NotFoundException('Account not found.');
    }
    const code = this.makeRandomString(this.codeConfig.length);
    let expired = this.makeExpired(this.codeConfig.expired_number, this.codeConfig.expired_unit);
    const url = body.resetPasswordRedirectUri + '?email=' + hasAccount.email + '&code=' + code;
    
    try {
      let confirmation = await this.confirmationRepo.findOne({
        where: {
          email: hasAccount.email,
          type: accountConfirmationType.RESET_PASSWORD,
        },
      });
      if (!confirmation) {
        confirmation = this.confirmationRepo.create();
        confirmation.email = hasAccount.email;
      }
      confirmation.expired = expired;
      confirmation.code = code;
      confirmation.type = accountConfirmationType.RESET_PASSWORD;
      await this.confirmationRepo.save(confirmation);
      
      // TODO: send email
      
      return this.responseOk();
    } catch (err) {
      console.log(err);
      this.logger.error(err.stack);
      
      throw new InternalServerErrorException();
    }
  }
  
  async verifyCode(body: VerifyDto) {
    const account = await this.userRepo.findOne({ where: { email: body.email } });
    if (!account) {
      throw new NotFoundException('Account not found.');
    }
    await this.confirmationService.verifyCode(account.email, body.code, accountConfirmationType.RESET_PASSWORD);
    
    return this.responseOk();
  }
  
  async updatePassword(body: ResetPasswordDto) {
    const account = await this.userRepo.findOne({ where: { email: body.email } });
    if (!account) {
      throw new NotFoundException('Account not found.');
    }
    const confirmation = await this.confirmationService.verifyCode(account.email, body.code, accountConfirmationType.RESET_PASSWORD);
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const salt = await bcrypt.genSalt();
      account.password = await bcrypt.hash(body.password, salt);
      await queryRunner.manager.save(User, account);
      
      // Delete confirm information
      await queryRunner.manager.update(UserConfirmation, confirmation, {
        code: null,
        expired: null,
      });
      await queryRunner.commitTransaction();
      
      const payload = await this.authService.makePayload(account);
      
      return this.responseOk({
        access_token: this.jwtService.sign(payload),
      });
    } catch (err) {
      await queryRunner.rollbackTransaction();
      this.logger.error(err.stack);
      
      throw new BadRequestException('Update failed.');
    } finally {
      await queryRunner.release();
    }
  }
}