import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { recordingProviders } from './recording.providers';
import { RecordingService } from './recording.service';
import { UserModule } from '../user/user.module';
import { RecordingController } from './recording.controller';

@Module({
  controllers: [
    RecordingController
  ],
  imports: [
    DatabaseModule,
    UserModule
  ],
  components: [
    ...recordingProviders,
    RecordingService
  ]
})
export class RecordingModule {}
