import { UnknownAgentMessage } from './messages';

export class UnknownAgentException extends Error {
  constructor () {
    super(UnknownAgentMessage);
  }
}
