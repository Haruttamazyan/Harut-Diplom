import { IAuthTokenContent, IPaginationQuery, IDateRange } from '../../../interfaces';
import { CompanyStatus } from '../types';

export interface ICreateCompanyPayload {
  company: {
    company_name: string;
    address1: string;
    address2?: string;
    country: string;
    state: string;
    city: string;
    phone: string;
    zipcode:string;
    email: string;
    user_uuid:string;
  };
  //owner: IAuthTokenContent;
}

export interface ISetStatusPayload {
  userId: string;
  companyId: string;
  status: CompanyStatus;
}

export interface IGetCompaniesPayload extends IPaginationQuery {
  status?: CompanyStatus;
  range: IDateRange;
}
