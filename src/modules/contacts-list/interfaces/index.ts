import { IPaginationQuery, IAuthTokenContent } from '../../../interfaces';

export interface IEditContactsListPayload {
  contact_list_name?: string;
  contact_file_url?: string;
  contact_file_count?: number;
  contact_file_column_count?: number;
  contact_count?: number;
}

export interface IImportContactsFilePayload {
  contact_file_url?: string;
  contact_file_count?: number;
  contact_file_column_count?: number;
  contact_count?: number;  
}

export interface ICreateContactsListPayload {
  user: IAuthTokenContent;
  contact_list_name: string;
  contact_file_url?: string;
  contact_file_count?: number;
  contact_file_column_count?: number;
}

export interface IBindings {
  firstName: number;
  lastName?: number;
  phoneNumber: number;
  address?: number;
  city?: number;
  state?: number;
  country?: number;
  udf?: {
    [x: string]: number;
  };
}

export interface ISetContactsListBindingsPayload {
  listId: string;
  companyId: string;
  bindings: IBindings;
}

export interface ISetContactsListBindingsResult {
  contactsListId: string;
  duplicate: number;
  success: number;
  error: number;
  total: number;
  processed: number;
}

export interface IParseRawContactsFileResult {
  count: number;
  contactsPreview: any[][];
}

export interface IGetContactsListsByCompanyPayload extends IPaginationQuery {
  companyId: string;
}

export interface IDeleteContactsPayload {
  contactsListId: string;
  contactsIds: string[];
}
