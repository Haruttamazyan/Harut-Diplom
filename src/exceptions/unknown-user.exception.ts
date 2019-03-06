import { UnknownUserMessage } from './messages';

export class UnknownUserException extends Error {
  constructor () {
    super(UnknownUserMessage);
  }
}
