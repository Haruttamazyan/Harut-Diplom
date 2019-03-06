import { dbConnectionToken, recordingRepositoryToken } from '../../constants';
import { Connection } from 'typeorm';
import { RecordingEntity } from './recording.entity';

export const recordingProviders = [
  {
    provide: recordingRepositoryToken,
    inject: [dbConnectionToken],
    useFactory: (connection: Connection) => {
      return connection.getRepository(RecordingEntity);
    }
  }
];
