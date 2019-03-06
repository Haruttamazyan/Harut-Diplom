export class UnknownContactsListException extends Error {
  constructor (id: string) {
    super(`List with id "${id}" does not exist.`);
  }
}
