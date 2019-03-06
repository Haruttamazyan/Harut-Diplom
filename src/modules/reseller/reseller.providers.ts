import { dbConnectionToken, resellerRepositoryToken, pricingRepositoryToken } from '../../constants';
import { Connection } from 'typeorm';
import { ResellerEntity } from './reseller.entity';
import { PricingEntity } from './pricing.entity'

export const resellerProviders = [
  {
    provide: resellerRepositoryToken,
    inject: [dbConnectionToken],
    useFactory: (connection: Connection) => {
      return connection.getRepository(ResellerEntity);
    }
  },

  {
    provide: pricingRepositoryToken,
    inject: [dbConnectionToken],
    useFactory: (connection: Connection) => {
      return connection.getRepository(PricingEntity);
    }
  }
];
