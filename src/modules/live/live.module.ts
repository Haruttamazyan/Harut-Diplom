import { Module } from '@nestjs/common';
import { LiveController } from './live.controller';
import { LiveService } from './live.service';
import { DatabaseModule } from '../database/database.module';
import { OCampaignModule } from '../campaign/outbound/o-campaign.module'
import { LiveProviders } from './live.providers'
import { UserModule } from '../user/user.module'
@Module({
  imports: [
    DatabaseModule,
    OCampaignModule,
    UserModule
  ],
  controllers: [
    LiveController
  ],
  components: [
    LiveService,
    ...LiveProviders
  ]
})
export class LiveModule {}
