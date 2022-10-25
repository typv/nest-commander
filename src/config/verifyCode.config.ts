import { registerAs } from '@nestjs/config';

export default registerAs('verifyCode', () => ({
  expired_number: process.env.VERIFY_CODE_EXPIRED_NUMBER,
  expired_unit: process.env.VERIFY_CODE_EXPIRED_UNIT,
  length: 20,
}));