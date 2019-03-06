export class UnknownCompanyException extends Error {
  constructor () {
    super('This company does not exist.');
  }
}
