export interface IAuthTokenContent {
  id: string;
  role: string;
  companyId?: string;
  is_company_admin?: boolean;
}

export interface IAuthTokenized {
  token: string;
}

export interface forgetEmail{
  email:string
}
