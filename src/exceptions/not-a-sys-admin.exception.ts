import { NotASysAdminMessage } from './messages';

export class NotASysAdminException extends Error {
  constructor () {
    super(NotASysAdminMessage);
  }
}
