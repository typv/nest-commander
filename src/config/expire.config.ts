import { registerAs } from '@nestjs/config';

export default registerAs('expire', () => ({
  invitation: {
    number: process.env.INVITATION_EXPIRED_NUMBER || 7,
    unit: process.env.INVITATION_EXPIRED_UNIT || 'days',
  }
}));