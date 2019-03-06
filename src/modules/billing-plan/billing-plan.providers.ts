import { dbConnectionToken, BillingPlanRepositoryToken, BillingPlanSysRepositoryToken } from '../../constants';
import { Connection } from 'typeorm';
import { BillingPlanEntity } from './billing-plan.entity';
import { BillingPlanSysEntity } from './billing-plan-sys.entity'

export const BillingPlanProviders = [
  {
    provide: BillingPlanRepositoryToken,
    inject: [dbConnectionToken],
    useFactory: (connection: Connection) => {
      return connection.getRepository(BillingPlanEntity);
    }
  },

  {
    provide: BillingPlanSysRepositoryToken,
    inject: [dbConnectionToken],
    useFactory: (connection: Connection) => {
      return connection.getRepository(BillingPlanSysEntity);
    }
  }
];
