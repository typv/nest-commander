import {IsNotEmpty, IsString, Matches, MaxLength, MinLength} from 'class-validator';
import {PickType} from "@nestjs/mapped-types";
import {VerifyDto} from "./verify.dto";

export class ResetPasswordDto extends PickType(VerifyDto, [
  'email',
  'code',
] as const) {
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  @MaxLength(64)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z]).*$/, {message: 'password too weak'})
  password: string;
}