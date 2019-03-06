export class DuplicateBindingException extends Error {
  constructor (key: string) {
    super(`Property "${key}" contains a duplicated binding.`);
  }
}
