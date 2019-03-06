import { ContactsListEntity } from '../../../contacts-list.entity';
import { CompanyEntity } from '../../../../company/company.entity';
import { IPaginationQuery } from '../../../../../interfaces';

export interface IUpdateContact {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  udf?: {
    [x: string]: string;
  };
}

export interface IContact extends IUpdateContact {
  firstName: string;
  phoneNumber: string;
}

export interface ICreateContactPayload extends IContact {
  contactsList: ContactsListEntity;
  company: CompanyEntity;
}

export interface IUpdateContactPayload {
  contactsListId: string;
  companyId: string;
  contactId: string;
  contact: IUpdateContact;
}

export interface IFindContactsPayload extends IPaginationQuery {
  companyId: string;
  contactsListId: string;
}

export interface IDeleteContactsPayload {
  companyId: string;
  contactsListId: string;
  contactsIds: string[];
}

export interface IDeleteAllContactsPayload {
  companyId: string;
  contactsListId: string;
}
