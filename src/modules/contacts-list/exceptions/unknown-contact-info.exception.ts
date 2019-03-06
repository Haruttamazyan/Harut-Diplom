export class UnknownContactException extends Error {
    constructor (id: string) {
      super(`Contact with id "${id}" does not exist.`);
    }
  }
  