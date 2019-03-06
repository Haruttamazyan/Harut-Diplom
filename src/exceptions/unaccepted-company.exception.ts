export class UnacceptedCompanyException extends Error {
  constructor (id: string, status: string) {
    super(`Company with id ${id} must have status 'accepted' to perform this action, but it's '${status}' instead`);
  }
}
