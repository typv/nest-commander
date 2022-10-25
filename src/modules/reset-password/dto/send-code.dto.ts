import { IsEmail, IsString } from 'class-validator';

export class SendCodeDto {
  @IsString()
  @IsEmail()
  email: string;

  @IsString()
  resetPasswordRedirectUri: string;
}
