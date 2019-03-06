import { Connection } from 'typeorm';
import { dbConnectionToken, Fed_DncRepositoryToken, userRepositoryToken } from '../../constants/tokens';
import { FedDncEntity } from './fed_dnc.entity';
import { UserEntity } from '../user/user.entity'

export const fedDncProviders = [
  {
    provide: Fed_DncRepositoryToken,
    useFactory: (connection: Connection) => connection.getRepository(FedDncEntity),
    inject: [dbConnectionToken]
  },
  {
    provide: userRepositoryToken,
    useFactory: (connection: Connection) => connection.getRepository(UserEntity),
    inject: [dbConnectionToken]
  }
];
