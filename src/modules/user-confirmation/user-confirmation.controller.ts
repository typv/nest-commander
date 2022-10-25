import { Body, Controller, Post } from '@nestjs/common';
import { UserConfirmationService } from './user-confirmation.service';
import { VerifyEmailDto } from './dto/verify-email.dto';

@Controller('confirmation')
export class UserConfirmationController {
  constructor(
    private readonly confirmationService: UserConfirmationService,
  ) {
  }
  
  @Post('verify-email/send-code')
  async verifyEmailSendCode() {
    return this.confirmationService.verifyEmailSendCode();
  }
  
  @Post('verify-email')
  async verifyEmail(@Body() body: VerifyEmailDto) {
    return this.confirmationService.verifyEmail(body);
  }
}
