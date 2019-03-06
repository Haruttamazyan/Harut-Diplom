export class DuplicateContactException extends Error {
  constructor (listId: string, phoneNumber: string) {
    super(
      `The phone number "${phoneNumber}" is already assigned to another user in ` +
      `the list with id "${listId}".`
    );
  }
}
