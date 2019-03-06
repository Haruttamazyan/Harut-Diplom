import * as jwt from 'jsonwebtoken';
import { JWT_KEY, JWT_ID, JWT_EXPIRATION, JWT_ALGORITHM } from '../config';
import { IAuthTokenContent, forgetEmail } from '../interfaces';

export const signToken = (payload: IAuthTokenContent): string => {
  return jwt.sign(payload, JWT_KEY, {
    jwtid: JWT_ID,
    expiresIn: JWT_EXPIRATION,
    algorithm: JWT_ALGORITHM
  });
};

export const forgetToken = (payload: forgetEmail): string => {
  return jwt.sign(payload, JWT_KEY, {
    jwtid: JWT_ID,
    expiresIn: JWT_EXPIRATION,
    algorithm: JWT_ALGORITHM
  });
};

export const getAuthTokenContent = (token?: string): IAuthTokenContent => {
  if (!token) {
    throw new Error('no-token');
  }

  const [type, content] = token.split(' ');

  if (type !== 'Bearer') {
    throw new Error('invalid-token-type');
  }

  try {
    return jwt.verify(content, JWT_KEY) as IAuthTokenContent;
  } catch (e) {
    throw new Error('invalid-token');
  }
};
