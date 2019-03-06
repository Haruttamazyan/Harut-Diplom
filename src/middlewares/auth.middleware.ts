import { getAuthTokenContent } from '../utilities/jwt';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

/**
 * Indicates the list of routes that don't need authentication.
 * Items listed here will bypass auth middleware.
 */
export interface IWhiteListItem {
  url: string;
  methods?: string[];
}

/**
 * @description
 * Utility to check if a route is on the white list
 */
export const isWhiteListed = (whiteList: IWhiteListItem[], req: Request): boolean => {
  const item = whiteList.find(elem => elem.url === req.url);
  return !!(
    item &&
    (!item.methods || item.methods.find(method => method.toUpperCase() === req.method))
  );
};

/**
 * @throws UnauthorizedException if there is no token in authorization header.
 * @throws BadRequestException if token does not start with "Bearer ".
 * @throws UnauthorizedException if token is invalid.
 * @example AuthMiddleware([
 *   { url: '/auth/register' },
 *   { url: '/auth/login', methods: ['post'] }
 * ])
 */
export const AuthMiddleware = (whiteList: IWhiteListItem[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (isWhiteListed(whiteList, req)) {
      return next();
    }

    try {
      (req as any).user = getAuthTokenContent(req.headers.authorization as string | undefined);

      next();
    } catch (e) {
      switch (e.message) {
        case 'no-token':
          throw new UnauthorizedException('No token specified');
        case 'invalid-token-type':
          throw new BadRequestException(`Token must start with 'Bearer '`);
        case 'invalid-token':
          throw new UnauthorizedException('Invalid token');
        default:
          throw e;
      }
    }
  };
};
