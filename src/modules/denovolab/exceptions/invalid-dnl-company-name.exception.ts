export class InvalidDnlCompanyNameException extends Error {
  constructor (name: string) {
    super(`Name "${name}" is invalid company name. 
      Please use only alphanumeric characters.`);
  }
}
