import { dbConnectionToken, contactRepositoryToken } from '../../../../constants';
import { Connection } from 'typeorm';
import { ContactEntity } from './contact.entity';

export const contactProviders = [
  {
    provide: contactRepositoryToken,
    inject: [dbConnectionToken],
    useFactory: (connection: Connection) => {
      return connection.getRepository(ContactEntity);
    }
  }
];
