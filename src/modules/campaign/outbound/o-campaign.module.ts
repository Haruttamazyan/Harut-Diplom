import { Module,forwardRef } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { OCampaignController } from './o-campaign.controller';
import { oCampaignProviders } from './o-campaign.providers';
import { OCampaignService } from './o-campaign.service';
import { UserModule } from '../../user/user.module';
import { OCampaignFsService } from './o-campaign-fs.service';
//import { DenovolabModule } from '../../denovolab/denovolab.module';
import { CompanyModule } from '../../company/company.module';
import { CampaignClass4Service } from './o-campaign.class4';
import { OCampaignGateway } from './o-campaign.gateway'
@Module({
  imports: [
    DatabaseModule,
    forwardRef(() => UserModule),
    CompanyModule
  ],
  controllers: [
    OCampaignController
  ],
  components: [
    ...oCampaignProviders,
    OCampaignService,
    OCampaignFsService,
    CampaignClass4Service,
    //OCampaignGateway
  ],
  exports:[
    OCampaignFsService
  ]
})
export class OCampaignModule {}
