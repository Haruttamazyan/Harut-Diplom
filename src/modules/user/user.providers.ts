import { Connection } from 'typeorm';
import { dbConnectionToken, oCampaignRepositoryToken, contactsInfoRepositoryToken, userRepositoryToken, agentRepositoryToken, didRepositoryToken, paymentRepositoryToken, userPermissionsRepositoryToken } from '../../constants/tokens';
import { UserEntity } from './user.entity';
//import { AgentEntity } from './agent.entity';
import { UserPermissionsEntity } from './user-permissions.entity';
import { PaymentsEntity } from './payment.entity';
import { oCampaignConnectedCallsConfigToken,resellerRepositoryToken, oCampaignConnectedCallsAndAgentsToken, oCampaignConnectedSalesToken } from '../../constants';
import { OCampaignConnectedCallsConfigEntity } from '../campaign/outbound/entities/o-campaign-connected-calls-config.entity';
import { OCampaignConnectedCallsAndAgentsEntity } from '../campaign/outbound/entities/o-campaign-connected-calls-and-agents.entity';
import { OCampaignConnectedSalesEntity } from '../campaign/outbound/entities/o-campaign-connected-sales.entity';
import { DidEntity } from './did.entity';
import { ResellerEntity } from '../reseller/reseller.entity'
import { ContactsInfoEntity } from '../contacts-list/contacts-info.entity'
import { OCampaignEntity } from '../campaign/outbound/entities/o-campaign.entity'

export const userProviders = [
  {
    provide: userRepositoryToken,
    useFactory: (connection: Connection) => connection.getRepository(UserEntity),
    inject: [dbConnectionToken]
  },

  {
    provide: oCampaignRepositoryToken,
    useFactory: (connection: Connection) => connection.getRepository(OCampaignEntity),
    inject: [dbConnectionToken]
  },
  {
    provide: contactsInfoRepositoryToken,
    useFactory: (connection: Connection) => connection.getRepository(ContactsInfoEntity),
    inject: [dbConnectionToken]
  },
  {
    provide: resellerRepositoryToken,
    useFactory: (connection: Connection) => connection.getRepository(ResellerEntity),
    inject: [dbConnectionToken]
  },
  {
    provide: userPermissionsRepositoryToken,
    useFactory: (connection: Connection) => connection.getRepository(UserPermissionsEntity),
    inject: [dbConnectionToken]
  },
  {
    provide: paymentRepositoryToken,
    useFactory: (connection: Connection) => connection.getRepository(PaymentsEntity),
    inject: [dbConnectionToken]
  },
  /*{
    provide: agentRepositoryToken,
    useFactory: (connection: Connection) => connection.getRepository(AgentEntity),
    inject: [dbConnectionToken]
  },*/
  {
    provide: didRepositoryToken,
    useFactory: (connection: Connection) => connection.getRepository(DidEntity),
    inject: [dbConnectionToken]
  },
  {
    provide: oCampaignConnectedCallsConfigToken,
    useFactory: (connection: Connection) => connection.getRepository(OCampaignConnectedCallsConfigEntity),
    inject: [dbConnectionToken]
  },
  {
    provide: oCampaignConnectedCallsAndAgentsToken,
    useFactory: (connection: Connection) => connection.getRepository(OCampaignConnectedCallsAndAgentsEntity),
    inject: [dbConnectionToken]
  },
  {
    provide: oCampaignConnectedSalesToken,
    useFactory: (connection: Connection) => connection.getRepository(OCampaignConnectedSalesEntity),
    inject: [dbConnectionToken]
  }
];
