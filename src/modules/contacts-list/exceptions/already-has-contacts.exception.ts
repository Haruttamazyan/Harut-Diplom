export class AlreadyHasContactsException extends Error {
  constructor (id: string) {
    super(`Contacts list with id "${id}" already has assigned contacts.`);
  }
}
