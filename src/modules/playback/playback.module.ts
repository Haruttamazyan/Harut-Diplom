import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { playbackProviders } from './playback.providers';
import { PlaybackService } from './playback.service';
import { UserModule } from '../user/user.module';
import { PlaybackController } from './playback.controller';

@Module({
  controllers: [
    PlaybackController
  ],
  imports: [
    DatabaseModule,
    UserModule
  ],
  components: [
    ...playbackProviders,
    PlaybackService
  ]
})
export class PlaybackModule {}
