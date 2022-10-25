import { IsEmail, IsString } from 'class-validator';

export class VerifyDto {
    @IsString()
    @IsEmail()
    email: string;

    @IsString()
    code: string;
}
