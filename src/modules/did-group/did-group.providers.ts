import { Connection } from 'typeorm';
import { dbConnectionToken, didGroupRepositoryToken, didRepositoryToken } from '../../constants/tokens';
import { DidGroupEntity } from './did-gropu.entity';
import { DidEntity } from '../user/did.entity'

export const didGroupProviders = [
  {
    provide: didGroupRepositoryToken,
    useFactory: (connection: Connection) => connection.getRepository(DidGroupEntity),
    inject: [dbConnectionToken]
  },
  {
    provide: didRepositoryToken,
    useFactory: (connection: Connection) => connection.getRepository(DidEntity),
    inject: [dbConnectionToken]
  }
];
