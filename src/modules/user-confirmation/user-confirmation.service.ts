import {
  BadRequestException,
  Inject,
  Injectable, InternalServerErrorException,
  Logger, UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Connection, DataSource, Repository } from 'typeorm';
import { WINSTON_MODULE_PROVIDER } from "nest-winston";
import { ConfigType } from "@nestjs/config";
import { I18nService } from "nestjs-i18n";
import moment from "moment";
import { BaseService } from '../base/base.service';
import { UserConfirmation } from '../../entities/user-confirmation.entity';
import { User } from '../../entities/user.entity';
import verifyCodeConfig from 'src/config/verifyCode.config';
import { AuthService } from '../auth/auth.service';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { accountConfirmationType } from '../../constants/enum';

@Injectable()
export class UserConfirmationService extends BaseService {
  constructor(
    @InjectRepository(UserConfirmation) private confirmationRepos: Repository<UserConfirmation>,
    @InjectRepository(User) private loginRepos: Repository<User>,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    @Inject(verifyCodeConfig.KEY) private codeConfig: ConfigType<typeof verifyCodeConfig>,
    private authService: AuthService,
    private readonly trans: I18nService,
    private dataSource: DataSource,
  ) {
    super();
  }
  
  async verifyCode(email: string, code: any, type: number) {
    const confirmation = await this.confirmationRepos.findOne({
      where: {
        email: email,
        type: type,
      }
    });
    if (!confirmation) {
      throw new BadRequestException('Confirm information not exist.');
    }
    if (moment(confirmation?.expired).isBefore(this.now())) {
      throw new BadRequestException('Code has expired.');
    }
    if (confirmation.code != code) {
      throw new BadRequestException('Verify failed.');
    }
    
    return confirmation;
  }
  
  async verifyEmailSendCode() {
    const account = await this.authService.getUser();
    if (!account) {
      throw new UnauthorizedException();
    }
    const code = this.makeRandomNumber(100000, 900000);
    let expired = this.makeExpired(this.codeConfig.expired_number, this.codeConfig.expired_unit);
    try {
      let confirmation = await this.confirmationRepos.findOne({
        where: {
          email: account['email'],
          type: accountConfirmationType.VERIFY_EMAIL,
        }
      });
      if (!confirmation) {
        confirmation = this.confirmationRepos.create();
        confirmation.email = account['email'];
      }
      confirmation.expired = expired;
      confirmation.code = '' + code;
      confirmation.type = accountConfirmationType.VERIFY_EMAIL;
      await this.confirmationRepos.save(confirmation);
      
      // Send verify code
      /*await this.mailQueue.add('confirm_email', {
        subject: this.trans.t("email.verify_account.subject"),
        email: account['email'],
        code: code,
        name: account['firstName'],
      })*/
      
      return this.responseOk();
    } catch (err) {
      this.logger.error('ConfirmationService.verifyEmailSendCode', err);
      
      throw new InternalServerErrorException();
    }
  }
  
  async verifyEmail(body: VerifyEmailDto) {
    const account = await this.authService.getUser();
    if (!account) {
      throw new UnauthorizedException();
    }
    const confirmation = await this.verifyCode(
      account['email'],
      body.code,
      accountConfirmationType.VERIFY_EMAIL
    );
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      // Update account
      account['emailVerified'] = true;
      await queryRunner.manager.save(User, account);
      // Delete confirm information
      await queryRunner.manager.remove(UserConfirmation, confirmation);
      await queryRunner.commitTransaction();
      
      return this.responseOk();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      this.logger.error(err.stack);
      
      throw new InternalServerErrorException();
    } finally {
      await queryRunner.release();
    }
  }
}