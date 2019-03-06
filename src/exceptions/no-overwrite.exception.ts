import { NoOverwriteMessage } from './messages';

export class NoOverwriteException extends Error {
  constructor (property: string) {
    super(NoOverwriteMessage(property));
  }
}
