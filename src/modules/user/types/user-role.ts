export type SystemAdminType = 'system-admin';
export type CompanyAdminType = 'company-admin';
export type AgentType = 'agent';
export type AgentManagerType = 'agent-manager';
export type SalesType = 'sales';
export type ResellerType = 'reseller';
export type CompanyUserType = 'company-user';

export const ROLE_SYS_ADMIN: SystemAdminType = 'system-admin';
export const ROLE_COMPANY_ADMIN: CompanyAdminType = 'company-admin';
export const ROLE_COMPANY_USER: CompanyUserType = 'company-user';
export const ROLE_AGENT: AgentType = 'agent';
export const ROLE_AGENT_MANAGER: AgentManagerType = 'agent-manager';
export const ROLE_SALES: SalesType = 'sales';
export const ROLE_RESELLER: ResellerType = 'reseller';

export type AssignableUserRole = AgentType | AgentManagerType | SalesType | CompanyAdminType | ResellerType | CompanyUserType;

export type UserRole = AssignableUserRole | SystemAdminType | CompanyAdminType | ResellerType;

export const AssignableUserRoleArr: AssignableUserRole[] = [
  ROLE_AGENT,
  ROLE_AGENT_MANAGER,
  ROLE_SALES,
  ROLE_COMPANY_ADMIN,
  ROLE_RESELLER,
  ROLE_COMPANY_USER
];

export const UserRoleArr: UserRole[] = [
  ...AssignableUserRoleArr,
  ROLE_SYS_ADMIN
];
