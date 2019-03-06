import { Guard, CanActivate, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { NoCompanyException } from '../exceptions';

@Guard()
export class HasCompanyGuard implements CanActivate {
  public canActivate (request: Request, context: ExecutionContext): boolean {
    if (!(request as any).user.companyId) {
      throw new NoCompanyException();
    }
    return true;
  }
}
