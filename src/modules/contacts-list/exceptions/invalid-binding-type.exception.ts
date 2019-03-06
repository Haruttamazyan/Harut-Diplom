export class InvalidBindingTypeException extends Error {
  constructor (key: string, type: string) {
    super(`Bindings must be numbers, but property ${key} is a ${type}.`);
  }
}
