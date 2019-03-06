import { ExceptionFilter, Catch } from '@nestjs/common';
import { Response } from 'express';
import { UnknownUserException } from '../exceptions';

@Catch(UnknownUserException)
export class UnauthorizedExceptionFilter implements ExceptionFilter {
  public catch (exception: Error, response: Response) {
    response.status(401).json({
      statusCode: 401,
      error: 'Unauthorized',
      message: exception.message
    });
  }
}
