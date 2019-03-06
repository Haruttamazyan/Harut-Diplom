import { Module } from '@nestjs/common';
import { ResellerController } from './reseller.controller';
import { DatabaseModule } from '../database/database.module';
import { UserModule } from '../user/user.module';
import { resellerProviders } from './reseller.providers';
import { ResellerService } from './reseller.service';
import { ResellerClass4Service } from './reseller.class4'
import { BillingPlanModule } from '../billing-plan/billing-plan.module'

@Module({
  imports: [
    DatabaseModule,
    UserModule,
    BillingPlanModule
  ],
  controllers: [
    ResellerController
  ],
  components: [
    ...resellerProviders,
    ResellerService,
    ResellerClass4Service
  ]
})
export class ResellerModule {}
