import { UserEntity } from '../../user/user.entity';
import { CompanyEntity } from '../../company/company.entity';
import { IAuthTokenized } from '../../../interfaces';

export interface ILoginResponse extends IAuthTokenized {
  user: UserEntity;
  company: CompanyEntity;
}
