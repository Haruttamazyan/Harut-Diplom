import { dbConnectionToken, playbackRepositoryToken, oCampaignRepositoryToken, companyRepositoryToken } from '../../constants';
import { Connection } from 'typeorm';
import { PlaybackEntity } from './playback.entity'
import { OCampaignEntity } from '../campaign/outbound/entities/o-campaign.entity'
import { CompanyEntity } from '../company/company.entity'

export const playbackProviders = [
  {
    provide: playbackRepositoryToken,
    inject: [dbConnectionToken],
    useFactory: (connection: Connection) => {
      return connection.getRepository(PlaybackEntity);
    }
  },
  {
    provide: oCampaignRepositoryToken,
    inject: [dbConnectionToken],
    useFactory: (connection: Connection) => {
      return connection.getRepository(OCampaignEntity);
    }
  },
  {
    provide: companyRepositoryToken,
    inject: [dbConnectionToken],
    useFactory: (connection: Connection) => {
      return connection.getRepository(CompanyEntity);
    }
  }
];
