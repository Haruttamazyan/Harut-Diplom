export class DuplicateDnlCompanyNameException extends Error {
  constructor (name: string) {
    super(`Company with name "${name}" already exists.`);
  }
}
