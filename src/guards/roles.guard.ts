import { Guard, CanActivate, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { Reflector } from '@nestjs/core';
import { IAuthTokenContent } from '../interfaces';

@Guard()
export class RolesGuard implements CanActivate {
  constructor (
    private readonly reflector: Reflector
  ) {}

  public canActivate (request: Request, context: ExecutionContext): boolean {
    const roles = this.reflector.get<string[]>('roles', context.handler);

    if (!roles) {
      return true;
    }

    const user = (request as any).user as IAuthTokenContent;

    return roles.includes(user.role);
  }
}
