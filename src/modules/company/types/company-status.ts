export type PendingType = 'pending';
export const STATUS_PENDING: PendingType = 'pending';

export type AcceptedType = 'accepted';
export const STATUS_ACCEPTED: AcceptedType = 'accepted';

export type RejectedType = 'rejected';
export const STATUS_REJECTED: RejectedType = 'rejected';

export type CompanyStatus =
  PendingType |
  AcceptedType |
  RejectedType;

export const CompanyStatusArr: CompanyStatus[] = [
  STATUS_PENDING,
  STATUS_ACCEPTED,
  STATUS_REJECTED
];
