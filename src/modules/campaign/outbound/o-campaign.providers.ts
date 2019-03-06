import { dbConnectionToken, oCampaignRepositoryToken, oCampaignConnectedCallsAndAgentsToken,
   oCampaignConnectedCallsConfigToken, oCampaignAppointmentsConfigToken, recordingRepositoryToken,
   answerRepositoryToken, playbackRepositoryToken } from '../../../constants';
import { Connection } from 'typeorm';
import { OCampaignEntity } from './entities/o-campaign.entity';
import { OCampaignConnectedCallsAndAgentsEntity } from './entities/o-campaign-connected-calls-and-agents.entity';
import { OCampaignConnectedCallsConfigEntity } from './entities/o-campaign-connected-calls-config.entity';
import { OCampaignAppointmentConfigEntity } from './entities/o-campaign-appointment-config.entity';
//import { AgentEntity } from '../../user/agent.entity';
import { ContactsListEntity } from '../../contacts-list/contacts-list.entity';
import { userRepositoryToken, didRepositoryToken, oCampaignConnectedSalesToken, oCampaignConnectedMediaToken, oCampaignConnectedDNCToken,contactsListRepositoryToken, questionRepositoryToken } from  '../../../constants';
import { OCampaignConnectedSalesEntity } from './entities/o-campaign-connected-sales.entity';
import { OCampaignConnectedMediaEntity } from './entities/o-campaign-connected-media.entity';
import { OCampaignConnectedDNCEntity } from './entities/o-campaign-connected-dnc.entity'
import { OCampaignQuestionEntity } from './entities/o-campaign-question.entity';
import { OCampaignAnswerEntity } from './entities/o-campaign-answer.entity';
import { DidEntity } from '../../user/did.entity';
import { RecordingEntity } from '../../recording/recording.entity';
import { PlaybackEntity } from '../../playback/playback.entity';
import { UserEntity } from '../../user/user.entity'

export const oCampaignProviders = [
  {
    provide: oCampaignRepositoryToken,
    inject: [dbConnectionToken],
    useFactory: (connection: Connection) => {
      return connection.getRepository(OCampaignEntity);
    }
  },
  {
    provide: oCampaignConnectedCallsAndAgentsToken,
    inject: [dbConnectionToken],
    useFactory: (connection: Connection) => {
      return connection.getRepository(OCampaignConnectedCallsAndAgentsEntity);
    }
  },
  {
    provide: didRepositoryToken,
    useFactory: (connection: Connection) => connection.getRepository(DidEntity),
    inject: [dbConnectionToken]
  },
  {
    provide: oCampaignConnectedSalesToken,
    inject: [dbConnectionToken],
    useFactory: (connection: Connection) => {
      return connection.getRepository(OCampaignConnectedSalesEntity);
    }
  },
  {
    provide: oCampaignConnectedMediaToken,
    inject: [dbConnectionToken],
    useFactory: (connection: Connection) => {
      return connection.getRepository(OCampaignConnectedMediaEntity);
    }
  },
  {
    provide: oCampaignConnectedDNCToken,
    inject: [dbConnectionToken],
    useFactory: (connection: Connection) => {
      return connection.getRepository(OCampaignConnectedDNCEntity);
    }
  },
  {
    provide: oCampaignAppointmentsConfigToken,
    inject: [dbConnectionToken],
    useFactory: (connection: Connection) => {
      return connection.getRepository(OCampaignAppointmentConfigEntity);
    }
  },
  {
    provide: oCampaignConnectedCallsConfigToken,
    inject: [dbConnectionToken],
    useFactory: (connection: Connection) => {
      return connection.getRepository(OCampaignConnectedCallsConfigEntity);
    }
  },
  {
    provide: userRepositoryToken,
    useFactory: (connection: Connection) => connection.getRepository(UserEntity),
    inject: [dbConnectionToken]
  },
  {
    provide: contactsListRepositoryToken,
    useFactory: (connection: Connection) => connection.getRepository(ContactsListEntity),
    inject: [dbConnectionToken]
  },
  {
    provide: questionRepositoryToken,
    useFactory: (connection: Connection) => connection.getRepository(OCampaignQuestionEntity),
    inject: [dbConnectionToken]
  },
  {
    provide: answerRepositoryToken,
    useFactory: (connection: Connection) => connection.getRepository(OCampaignAnswerEntity),
    inject: [dbConnectionToken]
  },
  {
    provide: recordingRepositoryToken,
    useFactory: (connection: Connection) => connection.getRepository(RecordingEntity),
    inject: [dbConnectionToken]
  },
  {
    provide: playbackRepositoryToken,
    useFactory: (connection: Connection) => connection.getRepository(PlaybackEntity),
    inject: [dbConnectionToken]
  }
];
