import { dbConnectionToken, oCampaignRepositoryToken, userRepositoryToken } from '../../constants';
import { Connection } from 'typeorm';
import { OCampaignEntity } from '../campaign/outbound/entities/o-campaign.entity';
import { UserEntity } from '../user/user.entity'

export const LiveProviders = [
  {
    provide: oCampaignRepositoryToken,
    inject: [dbConnectionToken],
    useFactory: (connection: Connection) => {
      return connection.getRepository(OCampaignEntity);
    }
  },
  {
    provide: userRepositoryToken,
    inject: [dbConnectionToken],
    useFactory: (connection: Connection) => {
      return connection.getRepository(UserEntity);
    }
  }
];
