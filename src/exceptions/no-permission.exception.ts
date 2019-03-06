import { NoPermissionMessage } from './messages';

export class NoPermissionException extends Error {
  constructor (message?: string) {
    super(message || NoPermissionMessage);
  }
}
