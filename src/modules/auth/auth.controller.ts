import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { Public } from '../../decorators/public';
import { AuthService } from './auth.service';
import { GoogleLoginDto } from './dto/google-login.dto';
import { AuthDto } from './dto/auth.dto';
import { RegisterDto } from './dto/register.dto';

@Public()
@Controller()
export class AuthController {
  constructor(
    private authService: AuthService
  ) {}
  
  /*@Post('google-login')
  async googleLogin(@Body() body: GoogleLoginDto) {
    return this.authService.googleSignIn(body);
  }*/
  
  @Post('login')
  async login(@Body() body: AuthDto) {
    return this.authService.login(body);
  }
  
  /*@Post('register')
  async register(@Body() body: RegisterDto) {
    return this.authService.register(body);
  }*/
}
