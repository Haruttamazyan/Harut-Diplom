import { DuplicatedEmailMessage } from './messages';

export class DuplicatedEmailException extends Error {
  constructor () {
    super(DuplicatedEmailMessage);
  }
}
