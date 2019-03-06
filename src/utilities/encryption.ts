import * as crypto from 'crypto';
import { HMAC_ALGORITHM, HMAC_SECRET } from '../config';

export const encrypt = (password: string): string => {
  return crypto
    .createHmac(HMAC_ALGORITHM, HMAC_SECRET)
    .update(password)
    .digest('hex');
};
