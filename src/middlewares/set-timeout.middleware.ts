import { Request, Response, NextFunction } from 'express';

export const SetTimeoutMiddleware = (timeout: number) => {
  return (req: Request, res: Response, next: NextFunction) => {
    res.connection.setTimeout(timeout);
    next();
  };
};
