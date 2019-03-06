export class UnknownCampaignException extends Error {
  constructor (id: string) {
    super(`Campaign with id "${id}" does not exist.`);
  }
}
