import { ExceptionFilter, Catch } from '@nestjs/common';
import { Response } from 'express';
import {
  NotASysAdminException,
  NotACompanyAdminException,
  NoPermissionException,
  NoCompanyException,
  DuplicatedEmailException,
  UnacceptedCompanyException
} from '../exceptions';
import { UnknownCompanyException } from '../modules/company/exceptions';

@Catch(
  NotASysAdminException,
  NotACompanyAdminException,
  NoPermissionException,
  NoCompanyException,
  DuplicatedEmailException,
  UnacceptedCompanyException,
  UnknownCompanyException
)
export class ForbiddenExceptionFilter implements ExceptionFilter {
  public catch (exception: Error, response: Response) {
    response.status(403).json({
      statusCode: 403,
      error: 'Forbidden',
      message: exception.message
    });
  }
}
