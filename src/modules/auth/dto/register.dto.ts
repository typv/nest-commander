import { IsEmail, IsEnum, IsIn, IsNotEmpty, IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { Unique } from "src/decorators/custom-validator";
import { User } from '../../../entities/user.entity';

export class RegisterDto {
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  @Unique(User)
  email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  @MaxLength(64)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z]).*$/, {message: 'password too weak'})
  password: string;

  @IsNotEmpty()
  @IsString()
  userName: string;
}