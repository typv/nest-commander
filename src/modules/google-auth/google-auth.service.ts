import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { OAuth2Client } from 'google-auth-library';

@Injectable()
export class GoogleAuthService {
  private client;
  private googleClientID = this.configService.get('GOOGLE_CLIENT_ID');

  constructor(private configService: ConfigService) {
    this.client = new OAuth2Client(this.googleClientID);
  }

  async verify(idToken: string) {
    const ticket = await this.client.verifyIdToken({
      idToken: idToken,
      audience: this.googleClientID,
    });

    return ticket.getPayload();
  }
}