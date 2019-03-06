export class OutOfLimitBindingException extends Error {
  constructor (key: string, limit: number, value: number) {
    super(`Contacts list contains ${limit} fields, but property "${key}" is ${value} (zero-based).`);
  }
}
