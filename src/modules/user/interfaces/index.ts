import { CompanyEntity } from '../../company/company.entity';
import { AssignableUserRole, UserRole } from '../types';
import { IAuthTokenContent } from '../../../interfaces';

export interface IUserBase {
  first_name: string;
  last_name?: string;
  email: string;
  avatar?: string;
  phone?:string;
  is_active?:string;
  is_company_admin?:string;
  reseller_uuid?:string;
  state?:string;
  city?:string;
  address?:string
}

export interface IUserWithPassword extends IUserBase {
  password: string;
  reseller_uuid?:string
  state?:string,
  city?:string,
  address?:string,
  sipUsername?: string,
  sipPassword?:string,
  register_type?:string
}

export interface IUserPermissions {
  createAgents: boolean;
  editAgents: boolean;
  createContactsLists: boolean;
  editContactsLists: boolean;
  createOutboundCampaigns: boolean;
  editOutboundCampaigns: boolean;
  deleteOutboundCampaigns: boolean;
}

export type IUserPermissionType =
  'createAgents' |
  'editAgents' |
  'createContactsLists' |
  'editContactsLists' |
  'createOutboundCampaigns' |
  'editOutboundCampaigns' |
  'deleteOutboundCampaigns';

export interface IEnsureCanPerformActionPayload {
  user: IAuthTokenContent;
  action: IUserPermissionType;
}

export interface ICreateUserPayload extends IUserWithPassword {
  company?: CompanyEntity;
  role: UserRole;
  permissions?: IUserPermissions;
}

export interface ICreateResellerPayload extends IUserWithPassword {
  company?: CompanyEntity;
  role: UserRole;
  permissions?: IUserPermissions;
  phone?: string;
}

export interface ICreateCompanyUserPayload extends  IUserWithPassword {
  role: AssignableUserRole;
  permissions: IUserPermissions;
  company?: CompanyEntity;
  company_users?:CompanyEntity;
}

export interface IEditUserPayload extends IUserBase {
  role?: AssignableUserRole;
  oldPassword: string;
  newPassword: string;
  permissions?: Partial<IUserPermissions>;
}

export interface IEditAgentPayload extends IUserBase {
  oldPassword: string;
  newPassword: string;
  permissions?: Partial<IUserPermissions>;
  sipUsername?: string;
  sipPassword: string;
  extension: string;
  agent_manager: boolean;
  is_online: boolean;
  phone: string;
  is_on_hook: boolean;
}

export interface ILoginPayload {
  email: string;
  password: string;
}

export interface IFindByCompanyPayload {
  userId: string;
  companyId: string;
  offset: number;
  limit: number;
  role?: AssignableUserRole;
}