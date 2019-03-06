import { Module, forwardRef, NestModule, MiddlewaresConsumer, RequestMethod } from '@nestjs/common';
import { UserService } from './user.service';
import { PaymentsService } from './payments.service';
import { SetTimeoutMiddleware } from '../../middlewares';
import { userProviders } from './user.providers';
import { DatabaseModule } from '../database/database.module';
import { UserController } from './user.controller';
import { CompanyModule } from '../company/company.module';
import { AgentController } from './agent.controller';
import { SalesController } from './sales.controller';
import { PaymentsController } from './payments.controller';
import { OCampaignModule } from '../campaign/outbound/o-campaign.module'
@Module({
  imports: [
    DatabaseModule,
    forwardRef(() => OCampaignModule),
    forwardRef(() => CompanyModule)
  ],
  controllers: [
    UserController,
    AgentController,
    SalesController,
    PaymentsController
  ],
  components: [
    ...userProviders,
    UserService,
    PaymentsService
  ],
  exports: [
    UserService,
    PaymentsService
  ]
})
export class UserModule implements NestModule {
  public configure (consumer: MiddlewaresConsumer): void {
    // 30 minutes. Done so server doesn't timeout when uploading contacts.
    const timeout = 1800000;

    consumer.apply(SetTimeoutMiddleware(timeout)).forRoutes({
      path: '/user/:id',
      method: [RequestMethod.POST, RequestMethod.PATCH]
    });
  }
}
