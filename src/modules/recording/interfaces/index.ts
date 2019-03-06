import { IPaginationQuery } from '../../../interfaces';

export interface IGetRecordingsPayload extends IPaginationQuery {
  companyId: string;
}
