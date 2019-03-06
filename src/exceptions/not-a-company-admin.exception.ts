import { NotACompanyAdminMessage } from './messages';

export class NotACompanyAdminException extends Error {
  constructor () {
    super(NotACompanyAdminMessage);
  }
}
