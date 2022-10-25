import { Body, Controller, Get, Post } from '@nestjs/common';
import { ResetPasswordService } from './reset-password.service';
import { Public } from '../../decorators/public';
import { SendCodeDto } from './dto/send-code.dto';
import { VerifyDto } from './dto/verify.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Public()
@Controller('reset-password')
export class ResetPasswordController {
  constructor(
    private readonly resetPasswordService: ResetPasswordService,
  ) {
  }
  
  @Post('send-code')
  async sendCode(@Body() body: SendCodeDto) {
    return this.resetPasswordService.sendCode(body);
  }
  
  @Post('verify')
  async googleLogin(@Body() body: VerifyDto) {
    return this.resetPasswordService.verifyCode(body);
  }
  
  @Post('update-password')
  async register(@Body() body: ResetPasswordDto) {
    return this.resetPasswordService.updatePassword(body);
  }
}
