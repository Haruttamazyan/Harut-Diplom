import { getAuthTokenContent } from '../../utilities/jwt';

export const AuthWsMiddleware = (socket: any, next: any) => {
  try {
    const user = getAuthTokenContent(socket.handshake.query.auth_token);

    if (!user.companyId) {
      return next(new Error('no-company'));
    }

    socket.user = user;

    next();
  } catch (e) {
    next(new Error(e.message));
  }
};
