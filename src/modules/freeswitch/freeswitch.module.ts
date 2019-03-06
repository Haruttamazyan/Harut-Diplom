import { Module } from '@nestjs/common';
import { FreeswitchController } from './freeswitch.controller';
import { FreeswitchService } from './freeswitch.service';
import { UserModule } from '../user/user.module';
import { freeswitchProviders } from './freeswitch.providers';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [
    UserModule,
    DatabaseModule
  ],
  controllers: [
    FreeswitchController
  ],
  components: [
    FreeswitchService,
    ...freeswitchProviders,
  ],
  exports: [
    FreeswitchService
  ]
})
export class FreeswitchModule {}
