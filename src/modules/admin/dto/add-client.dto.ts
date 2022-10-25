import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { Unique } from "src/decorators/custom-validator";
import { User } from '../../../entities/user.entity';

export class AddClientDto {
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  @MaxLength(50)
  @Unique(User)
  email: string;
  
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  userName: string;
  
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  clientName: string;
  
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  clientBusinessName: string;
  
  @IsNotEmpty()
  @IsString()
  @MaxLength(15)
  phoneNumber: string;
}