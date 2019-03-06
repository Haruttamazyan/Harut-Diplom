import { NoCompanyMessage } from './messages';

export class NoCompanyException extends Error {
  constructor () {
    super(NoCompanyMessage);
  }
}
