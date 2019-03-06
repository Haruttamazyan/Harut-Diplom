import { dbConnectionToken, cdrRepositoryToken, userRepositoryToken } from '../../constants';
import { Connection } from 'typeorm';
import { CDREntity } from './entities/cdr.entity';
import { agentRepositoryToken } from  '../../constants';
//import { AgentEntity } from '../user/agent.entity';
import { UserEntity } from '../user/user.entity'

export const freeswitchProviders = [
  {
    provide: cdrRepositoryToken,
    useFactory: (connection: Connection) => connection.getRepository(CDREntity),
    inject: [dbConnectionToken]
  },
  /*{
    provide: agentRepositoryToken,
    useFactory: (connection: Connection) => connection.getRepository(AgentEntity),
    inject: [dbConnectionToken]
  },*/
  {
    provide: userRepositoryToken,
    useFactory: (connection: Connection) => connection.getRepository(UserEntity),
    inject: [dbConnectionToken]
  }
];
