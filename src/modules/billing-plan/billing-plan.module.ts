import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { BillingPlanProviders } from './billing-plan.providers';
import { BilingPlanService } from './billing-plan.service';
import { UserModule } from '../user/user.module';
import { billing_planController } from './billing-plan.controller';

@Module({
  controllers: [
    billing_planController
  ],
  imports: [
    DatabaseModule,
    UserModule
  ],
  components: [
    ...BillingPlanProviders,
    BilingPlanService
  ],
  exports:[
    BilingPlanService
  ]
})
export class BillingPlanModule {}
