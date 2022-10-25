import { Processor, Process, OnQueueActive, OnQueueCompleted, OnQueueFailed } from '@nestjs/bull';
import { Job } from 'bull';
import { MailerService } from '@nestjs-modules/mailer';
import { Inject, Logger } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import queueConfig from 'src/config/queue.config';

@Processor(queueConfig().queue_name.send_mail)
export class MailConsumer {
  constructor(
    private readonly mailerService: MailerService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {
  }

  @OnQueueActive()
  onActive(job: Job) {
    this.logger.debug(`Processing job ${job.id} of type ${job.name}. Data: ${JSON.stringify(job.data)}`);
  }

  @OnQueueCompleted()
  onComplete(job: Job, result: any) {
    this.logger.debug(`Completed job ${job.id} of type ${job.name}. Result: ${JSON.stringify(result)}`);
  }

  @OnQueueFailed()
  onError(job: Job<any>, error: any) {
    this.logger.debug(`Failed job ${job.id} of type ${job.name}: ${error.message}`, error);
  }

  @Process('confirm_email')
  async confirmEmailSend(job: Job<{
    toEmail: string,
    subject: string,
    redirectUrl: string,
  }>) {
    try {
      return await this.mailerService
        .sendMail({
          to: job.data.toEmail,
          subject: job.data.subject,
          template: 'reset_password',
          context: {
            clientVerifyUrl: job.data.redirectUrl,
          },
        })
    } catch (error) {
      this.logger.debug(`Failed to send confirm email to '${job.data.toEmail}'`, error)
    }
  }

  @Process('reset_password')
  async resetPwdSend(job: Job<{
    toEmail: string,
    subject: string,
    redirectUrl: string,
  }>) {
    try {
      return await this.mailerService
        .sendMail({
          to: job.data.toEmail,
          subject: job.data.subject,
          template: 'reset_password',
          context: {
            clientVerifyUrl: job.data.redirectUrl,
          },
        })
    } catch (error) {
      this.logger.debug(`Failed to send reset password email to '${job.data.toEmail}'`, error)
    }
  }
}