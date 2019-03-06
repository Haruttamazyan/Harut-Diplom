import { dbConnectionToken, appointmentRepositoryToken, oCampaignRepositoryToken } from '../../constants';
import { Connection } from 'typeorm';
import { AppointmentEntity } from './appointment.entity'
import { OCampaignEntity } from '../campaign/outbound/entities/o-campaign.entity'

export const appointmentProviders = [
  {
    provide: appointmentRepositoryToken,
    inject: [dbConnectionToken],
    useFactory: (connection: Connection) => {
      return connection.getRepository(AppointmentEntity);
    }
  },
  {
    provide: oCampaignRepositoryToken,
    inject: [dbConnectionToken],
    useFactory: (connection: Connection) => {
      return connection.getRepository(OCampaignEntity);
    }
  },
];
